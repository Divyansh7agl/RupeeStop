import asyncio
from dotenv import load_dotenv
load_dotenv()
import json
from agents.llm_client import LLMClient
from agents.planner import PlannerAgent
from models.schemas import QueryRequest

async def main():
    try:
        llm = LLMClient()
        planner = PlannerAgent(llm)
        req = QueryRequest(question='test', use_sample_data=True)
        res, logs = await planner.run(req)
        print("Success:", json.dumps(res.model_dump()))
    except Exception as e:
        print("Error:", repr(e))

asyncio.run(main())
