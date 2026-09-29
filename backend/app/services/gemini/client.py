"""
IP-SAKTI Backend — Official Google GenAI Client Wrapper
SIH26045
"""
import logging
from typing import Optional, Dict, Any
from app.services.gemini.config import get_gemini_config

logger = logging.getLogger(__name__)

_client_instance = None


def get_genai_client():
    """
    Returns cached instance of google.genai.Client if configured, else None.
    """
    global _client_instance
    cfg = get_gemini_config()
    if not cfg["is_configured"]:
        return None

    if _client_instance is None:
        try:
            from google import genai
            _client_instance = genai.Client(api_key=cfg["api_key"])
            logger.info("Initialized Google GenAI Client successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize google.genai.Client: {e}")
            return None

    return _client_instance


class GeminiClient:
    """
    Unified client for text generation and structured output using Gemini API.
    Supports both synchronous and asynchronous generation.
    """

    def __init__(self):
        self.cfg = get_gemini_config()

    @property
    def is_ready(self) -> bool:
        return self.cfg["is_configured"] and get_genai_client() is not None

    def generate_grounded_text(
        self,
        system_instruction: str,
        prompt: str,
        temperature: float = 0.2,
        max_output_tokens: int = 1500,
    ) -> Optional[str]:
        """
        Executes grounded text generation with low temperature for deterministic legal reasoning.
        Synchronous call using official google.genai client.
        """
        client = get_genai_client()
        if not client:
            return None

        try:
            from google.genai import types

            response = client.models.generate_content(
                model=self.cfg["model"],
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=temperature,
                    max_output_tokens=max_output_tokens,
                )
            )

            if response and response.text:
                return response.text.strip()
            return None
        except Exception as e:
            logger.warning(f"Gemini generate_grounded_text call failed, falling back: {e}")
            return None

    async def generate_grounded_text_async(
        self,
        system_instruction: str,
        prompt: str,
        temperature: float = 0.2,
        max_output_tokens: int = 1500,
    ) -> Optional[str]:
        """
        Asynchronous generation via client.aio.
        """
        client = get_genai_client()
        if not client:
            return None

        try:
            from google.genai import types

            response = await client.aio.models.generate_content(
                model=self.cfg["model"],
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=temperature,
                    max_output_tokens=max_output_tokens,
                )
            )

            if response and response.text:
                return response.text.strip()
            return None
        except Exception as e:
            logger.warning(f"Gemini async generate_grounded_text failed, falling back: {e}")
            return None
