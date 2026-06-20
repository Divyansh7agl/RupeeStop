"""
LLM Client: Gemini (primary) with Groq fallback.
Gemini used with Google Search grounding for market context tool.
All agent calls go through this client with automatic fallback logic.
"""

import os
import asyncio
import json
import time
from typing import Optional
import structlog

import google.generativeai as genai
from groq import AsyncGroq

logger = structlog.get_logger(__name__)

GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_FALLBACK_MODEL = "gemini-1.5-flash"
GROQ_MODEL = "llama-3.3-70b-versatile"


class LLMClient:
    def __init__(self):
        gemini_key = os.getenv("GEMINI_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")

        if not gemini_key:
            raise ValueError("GEMINI_API_KEY not set in environment")
        if not groq_key:
            raise ValueError("GROQ_API_KEY not set in environment")

        genai.configure(api_key=gemini_key)
        self.gemini_client = genai.GenerativeModel(GEMINI_MODEL)
        self.gemini_fallback_client = genai.GenerativeModel(GEMINI_FALLBACK_MODEL)
        self.gemini_search_client = genai.GenerativeModel(
            GEMINI_MODEL,
            tools=["google_search_retrieval"]
        )
        self.groq_client = AsyncGroq(api_key=groq_key)
        self.fallback_warning: Optional[str] = None  # set when fallback is used

        logger.info("llm_client.initialized", gemini_model=GEMINI_MODEL, gemini_fallback=GEMINI_FALLBACK_MODEL, groq_model=GROQ_MODEL)

    async def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        expect_json: bool = True,
        temperature: float = 0.3,
        max_retries: int = 2,
        provider: str = "gemini"
    ) -> str:
        """
        Primary: Gemini. Falls back to Groq on failure if provider is gemini.
        If provider is groq, uses Groq directly.
        Returns raw string (JSON or text).
        """
        if provider == "groq":
            try:
                result = await self._groq_complete(system_prompt, user_prompt, temperature)
                logger.info("llm.groq.success")
                return result
            except Exception as e:
                logger.error("llm.groq.failed", error=str(e))
                raise RuntimeError(f"Groq failed: {e}")

        gemini_error: Optional[str] = None
        for attempt in range(max_retries):
            try:
                result = await self._gemini_complete(system_prompt, user_prompt, temperature)
                logger.info("llm.gemini.success", attempt=attempt + 1)
                return result
            except Exception as e:
                gemini_error = str(e)
                logger.warning("llm.gemini.failed", attempt=attempt + 1, error=gemini_error)
                if attempt == max_retries - 1:
                    break
                await asyncio.sleep(1.5 ** attempt)

        # Gemini 1.5 Flash fallback
        try:
            result = await self._gemini_complete(system_prompt, user_prompt, temperature, client=self.gemini_fallback_client)
            self.fallback_warning = (
                f"Gemini {GEMINI_MODEL} limit reached — automatically switched to {GEMINI_FALLBACK_MODEL}."
            )
            logger.info("llm.gemini_fallback.success")
            return result
        except Exception as e:
            logger.warning("llm.gemini_fallback.failed", error=str(e))

        # Groq fallback
        try:
            result = await self._groq_complete(system_prompt, user_prompt, temperature)
            self.fallback_warning = (
                f"Gemini API limit reached — automatically switched to Groq ({GROQ_MODEL}). "
                f"Results may vary slightly."
            )
            logger.info("llm.groq.fallback_success")
            return result
        except Exception as e:
            logger.error("llm.groq.fallback_failed", error=str(e))
            raise RuntimeError(
                "Both Gemini (2.0 and 1.5) and Groq API rate limits have been reached. "
                "Please wait a few minutes and try again."
            )

    async def _gemini_complete(self, system_prompt: str, user_prompt: str, temperature: float, client=None) -> str:
        if client is None:
            client = self.gemini_client
            
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        config = genai.GenerationConfig(temperature=temperature)

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: client.generate_content(full_prompt, generation_config=config)
        )
        return response.text.strip()

    async def _groq_complete(self, system_prompt: str, user_prompt: str, temperature: float) -> str:
        response = await self.groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=temperature,
            max_tokens=2048
        )
        return response.choices[0].message.content.strip()

    async def search_market_context(self, query: str) -> str:
        """Gemini with Google Search grounding for live market data."""
        loop = asyncio.get_event_loop()
        try:
            response = await loop.run_in_executor(
                None,
                lambda: self.gemini_search_client.generate_content(
                    f"Provide current market context for Indian mutual fund investors: {query}. "
                    f"Include recent performance data, market trends, and relevant economic indicators."
                )
            )
            return response.text.strip()
        except Exception as e:
            logger.warning("llm.gemini_search.failed_falling_back", error=str(e))
            return await self.groq_market_context(query)

    async def groq_market_context(self, query: str) -> str:
        """Groq fallback for market context using training knowledge."""
        response = await self.groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an Indian financial market expert. Provide context based on your knowledge. "
                        "Always note that this is based on training data, not live search."
                    )
                },
                {"role": "user", "content": f"Provide market context for: {query}"}
            ],
            temperature=0.2,
            max_tokens=1024
        )
        return response.choices[0].message.content.strip()

    async def complete_json(self, system_prompt: str, user_prompt: str, temperature: float = 0.3, provider: str = "gemini") -> dict:
        """Complete and parse JSON response with cleaning."""
        raw = await self.complete(system_prompt, user_prompt, expect_json=True, temperature=temperature, provider=provider)
        return self._parse_json(raw)

    def _parse_json(self, raw: str) -> dict:
        """Strip markdown fences and parse JSON safely."""
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            cleaned = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
        cleaned = cleaned.strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error("llm.json_parse_failed", error=str(e), raw_preview=cleaned[:200])
            raise ValueError(f"LLM returned invalid JSON: {e}\nRaw: {cleaned[:300]}")
