"""
LLM Client: Gemini (primary) with Groq fallback.
Supports multiple API keys per provider — automatically rotates to the next
key when the current one hits its rate limit (429 / ResourceExhausted).

.env format:
  GEMINI_API_KEYS=key1,key2,key3
  GROQ_API_KEYS=key1,key2

Legacy single-key vars (GEMINI_API_KEY / GROQ_API_KEY) are still supported
and automatically merged into the pool.
"""

import os
import asyncio
import json
import time
import threading
from typing import Optional, List
import structlog

import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted, TooManyRequests
from groq import AsyncGroq, RateLimitError as GroqRateLimitError

logger = structlog.get_logger(__name__)

GEMINI_MODEL = "gemini-2.0-flash"
GROQ_MODEL   = "llama-3.3-70b-versatile"

# How long (seconds) to cool down an exhausted key before retrying it
COOLDOWN_SECONDS = 60


def _load_keys(multi_var: str, single_var: str) -> List[str]:
    """
    Load API keys from env.  Prefers MULTI_VAR (comma-separated list),
    but also includes SINGLE_VAR if set, deduplicating.
    """
    keys: List[str] = []

    multi = os.getenv(multi_var, "")
    for k in multi.split(","):
        k = k.strip()
        if k:
            keys.append(k)

    single = os.getenv(single_var, "").strip()
    if single and single not in keys:
        keys.append(single)

    return keys


class KeyPool:
    """
    Thread-safe rotating pool of API keys.
    On rate-limit, the current key is cooled down and the next key is tried.
    """

    def __init__(self, keys: List[str], provider: str):
        if not keys:
            raise ValueError(f"No API keys found for provider '{provider}'. "
                             f"Set {provider.upper()}_API_KEYS or {provider.upper()}_API_KEY in .env")
        self._keys      = list(keys)
        self._provider  = provider
        self._lock      = threading.Lock()
        # cooldown_until[i] = monotonic timestamp after which key[i] is usable again (0 = always usable)
        self._cooldown_until: List[float] = [0.0] * len(keys)
        self._index     = 0   # round-robin cursor
        logger.info(f"key_pool.init", provider=provider, num_keys=len(keys))

    def get(self) -> Optional[str]:
        """Return a currently available key, or None if all are cooling down."""
        now = time.monotonic()
        with self._lock:
            for offset in range(len(self._keys)):
                i = (self._index + offset) % len(self._keys)
                if now >= self._cooldown_until[i]:
                    self._index = (i + 1) % len(self._keys)   # advance cursor
                    return self._keys[i]
        return None   # all keys exhausted right now

    def mark_exhausted(self, key: str):
        """Put key in cooldown after hitting a rate limit."""
        with self._lock:
            try:
                i = self._keys.index(key)
                self._cooldown_until[i] = time.monotonic() + COOLDOWN_SECONDS
                logger.warning("key_pool.key_exhausted",
                               provider=self._provider,
                               key_suffix=key[-6:],
                               cooldown_s=COOLDOWN_SECONDS)
            except ValueError:
                pass

    @property
    def total(self) -> int:
        return len(self._keys)

    def available_count(self) -> int:
        now = time.monotonic()
        with self._lock:
            return sum(1 for cd in self._cooldown_until if now >= cd)


def _is_rate_limit_error(exc: Exception) -> bool:
    """Detect 429 / rate-limit errors across Gemini and Groq."""
    if isinstance(exc, (ResourceExhausted, TooManyRequests)):
        return True
    if isinstance(exc, GroqRateLimitError):
        return True
    msg = str(exc).lower()
    return "429" in msg or "rate limit" in msg or "quota" in msg or "resource exhausted" in msg


class LLMClient:
    def __init__(self):
        gemini_keys = _load_keys("GEMINI_API_KEYS", "GEMINI_API_KEY")
        groq_keys   = _load_keys("GROQ_API_KEYS",   "GROQ_API_KEY")

        self._gemini_pool = KeyPool(gemini_keys, "gemini")
        self._groq_pool   = KeyPool(groq_keys,   "groq")

        # Pre-build Groq clients keyed by API key string
        self._groq_clients = {k: AsyncGroq(api_key=k) for k in groq_keys}

        logger.info("llm_client.initialized",
                    gemini_keys=self._gemini_pool.total,
                    groq_keys=self._groq_pool.total,
                    gemini_model=GEMINI_MODEL,
                    groq_model=GROQ_MODEL)

    # ──────────────────────────────────────────────────────────────
    # Public interface
    # ──────────────────────────────────────────────────────────────

    async def complete(
        self,
        system_prompt: str,
        user_prompt:   str,
        expect_json:   bool  = True,
        temperature:   float = 0.3,
        max_retries:   int   = 2,
        provider:      str   = "gemini",
    ) -> str:
        """
        Primary: Gemini. Falls back to Groq on failure if provider is gemini.
        If provider is groq, uses Groq directly.
        Within each provider, rotates across all available keys on rate-limit errors.
        Returns raw string (JSON or text).
        """
        if provider == "groq":
            return await self._complete_with_pool(
                self._groq_pool, self._groq_complete, system_prompt, user_prompt, temperature
            )

        # Gemini with Groq fallback
        try:
            return await self._complete_with_pool(
                self._gemini_pool, self._gemini_complete, system_prompt, user_prompt, temperature
            )
        except Exception as e:
            logger.warning("llm.gemini.all_keys_failed_falling_back_to_groq", error=str(e))
            return await self._complete_with_pool(
                self._groq_pool, self._groq_complete, system_prompt, user_prompt, temperature
            )

    async def complete_json(
        self,
        system_prompt: str,
        user_prompt:   str,
        temperature:   float = 0.3,
        provider:      str   = "gemini",
    ) -> dict:
        """Complete and parse JSON response with cleaning."""
        raw = await self.complete(system_prompt, user_prompt,
                                  expect_json=True, temperature=temperature,
                                  provider=provider)
        return self._parse_json(raw)

    async def search_market_context(self, query: str) -> str:
        """Gemini with Google Search grounding for live market data."""
        loop = asyncio.get_event_loop()
        key  = self._gemini_pool.get()
        if key is None:
            logger.warning("llm.gemini_search.all_keys_exhausted_using_groq")
            return await self.groq_market_context(query)

        try:
            # Per-request client — avoids global configure() race condition
            search_client = genai.GenerativeModel(
                GEMINI_MODEL,
                tools=["google_search_retrieval"],
                client_options={"api_key": key}
            )
            response = await loop.run_in_executor(
                None,
                lambda: search_client.generate_content(
                    f"Provide current market context for Indian mutual fund investors: {query}. "
                    f"Include recent performance data, market trends, and relevant economic indicators."
                )
            )
            return response.text.strip()
        except Exception as e:
            if _is_rate_limit_error(e):
                self._gemini_pool.mark_exhausted(key)
            logger.warning("llm.gemini_search.failed_falling_back", error=str(e))
            return await self.groq_market_context(query)

    async def groq_market_context(self, query: str) -> str:
        """Groq fallback for market context using training knowledge."""
        return await self._complete_with_pool(
            self._groq_pool,
            self._groq_complete,
            system_prompt=(
                "You are an Indian financial market expert. Provide context based on your knowledge. "
                "Always note that this is based on training data, not live search."
            ),
            user_prompt=f"Provide market context for: {query}",
            temperature=0.2,
        )

    # ──────────────────────────────────────────────────────────────
    # Internal helpers
    # ──────────────────────────────────────────────────────────────

    async def _complete_with_pool(self, pool: KeyPool, fn, system_prompt, user_prompt, temperature) -> str:
        """
        Try every available key in the pool in turn.
        On rate-limit: mark key exhausted, try next immediately.
        On other error: retry up to 2 times with backoff on the same key.
        """
        attempted: set = set()

        while True:
            key = pool.get()
            if key is None or key in attempted:
                available = pool.available_count()
                raise RuntimeError(
                    f"All {pool.total} {pool._provider} keys are exhausted or failed. "
                    f"Available: {available}. Retry in ~{COOLDOWN_SECONDS}s."
                )
            attempted.add(key)

            for attempt in range(2):
                try:
                    result = await fn(key, system_prompt, user_prompt, temperature)
                    logger.info(f"llm.{pool._provider}.success",
                                key_suffix=key[-6:], attempt=attempt + 1)
                    return result
                except Exception as e:
                    if _is_rate_limit_error(e):
                        pool.mark_exhausted(key)
                        logger.warning(f"llm.{pool._provider}.rate_limit_rotating",
                                       key_suffix=key[-6:])
                        break   # break inner loop → try next key
                    elif attempt < 1:
                        await asyncio.sleep(1.5)
                    else:
                        logger.error(f"llm.{pool._provider}.key_failed",
                                     key_suffix=key[-6:], error=str(e))
                        break   # try next key

    async def _gemini_complete(self, key: str, system_prompt: str, user_prompt: str, temperature: float) -> str:
        full_prompt = f"{system_prompt}\n\n{user_prompt}"
        config      = genai.GenerationConfig(temperature=temperature)
        loop        = asyncio.get_event_loop()

        # Use per-request client to avoid global configure() race condition
        # when concurrent requests use different keys
        client = genai.GenerativeModel(GEMINI_MODEL, client_options={"api_key": key})

        response = await loop.run_in_executor(
            None,
            lambda: client.generate_content(full_prompt, generation_config=config)
        )
        return response.text.strip()

    async def _groq_complete(self, key: str, system_prompt: str, user_prompt: str, temperature: float) -> str:
        client   = self._groq_clients.get(key)
        if client is None:
            client = AsyncGroq(api_key=key)
            self._groq_clients[key] = client

        response = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user",   "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=2048,
        )
        return response.choices[0].message.content.strip()

    def _parse_json(self, raw: str) -> dict:
        """Strip markdown fences and parse JSON safely."""
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            lines   = cleaned.split("\n")
            cleaned = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])
        cleaned = cleaned.strip()
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error("llm.json_parse_failed", error=str(e), raw_preview=cleaned[:200])
            raise ValueError(f"LLM returned invalid JSON: {e}\nRaw: {cleaned[:300]}")
