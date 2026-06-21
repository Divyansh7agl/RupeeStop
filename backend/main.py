"""
Investment Committee Agent - FastAPI Backend
Endpoints:
  POST /analyze        - Full pipeline, returns complete JSON
  POST /analyze/stream - SSE stream of pipeline logs + final result
  GET  /portfolio      - Returns sample portfolio data
  GET  /health         - Health check
"""

from dotenv import load_dotenv
load_dotenv()

import json
import time
import asyncio
import os
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models.schemas import QueryRequest, FinalRecommendation, PipelineLog
from agents.llm_client import LLMClient
from agents.planner import PlannerAgent
from data.portfolio import SAMPLE_PORTFOLIO

# ── Structured logging setup ──
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="ISO"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.BoundLogger,
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory()
)
logger = structlog.get_logger(__name__)

# ── App lifecycle ──
llm_client: LLMClient = None
planner: PlannerAgent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global llm_client, planner
    logger.info("app.startup")
    try:
        llm_client = LLMClient()
        planner = PlannerAgent(llm_client)
        logger.info("app.ready")
    except Exception as e:
        logger.error("app.startup_failed", error=str(e))
        raise
    yield
    logger.info("app.shutdown")


app = FastAPI(
    title="Investment Committee Agent",
    description="Multi-agent AI system simulating an investment committee.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "llm_ready": llm_client is not None,
        "timestamp": time.time()
    }


@app.get("/portfolio")
async def get_sample_portfolio():
    """Returns the sample portfolio used for analysis."""
    return SAMPLE_PORTFOLIO


@app.post("/analyze", response_model=FinalRecommendation)
async def analyze(request: QueryRequest):
    """
    Runs the full multi-agent pipeline and returns the complete recommendation.
    Blocking — waits for all agents to complete.
    """
    if not planner:
        raise HTTPException(status_code=503, detail="Service not ready. LLM client not initialized.")

    logger.info("api.analyze.start", question=request.question[:100])
    start = time.time()

    try:
        result, logs = await planner.run(request)
        duration = round((time.time() - start) * 1000, 2)
        logger.info("api.analyze.complete", duration_ms=duration, confidence=result.confidence_score)
        return result
    except Exception as e:
        logger.error("api.analyze.failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")


@app.post("/analyze/stream")
async def analyze_stream(request: QueryRequest):
    """
    SSE streaming endpoint.

    Uses an asyncio.Queue so each pipeline step is emitted the moment it
    completes — no more fake pre-emission followed by a long silence.
    Keepalive SSE comments (': ping') are sent every 15 s so that Render /
    Vercel proxies don't kill the connection during long LLM calls.
    """
    if not planner:
        raise HTTPException(status_code=503, detail="Service not ready.")

    # Sentinel object that signals the generator to stop
    _DONE = object()
    queue: asyncio.Queue = asyncio.Queue()

    async def run_pipeline():
        """Run the full pipeline; push events into the queue as they happen."""
        try:
            result, logs = await planner.run(request, event_queue=queue)

            # Flush any remaining log entries that weren't pushed mid-pipeline
            for log in logs:
                await queue.put({
                    "type": "step_update",
                    "step": log.step,
                    "status": log.status,
                    "message": log.details or ""
                })

            # Emit the final result
            await queue.put({
                "type": "final_result",
                "data": result.model_dump()
            })

        except Exception as e:
            logger.error("api.stream.pipeline_error", error=str(e))
            await queue.put({"type": "error", "message": str(e)})
        finally:
            await queue.put(_DONE)

    async def event_generator():
        logger.info("api.stream.start", question=request.question[:100])

        # Launch the pipeline concurrently — events will flow through the queue
        pipeline_task = asyncio.create_task(run_pipeline())

        try:
            while True:
                try:
                    # Wait up to 15 s; if nothing arrives send a keepalive ping
                    item = await asyncio.wait_for(queue.get(), timeout=15.0)
                except asyncio.TimeoutError:
                    # SSE comment lines keep the TCP connection alive
                    yield ": ping\n\n"
                    continue

                if item is _DONE:
                    break

                yield f"data: {json.dumps(item)}\n\n"

        finally:
            pipeline_task.cancel()
            try:
                await pipeline_task
            except asyncio.CancelledError:
                pass

        yield 'data: {"type": "done"}\n\n'

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )