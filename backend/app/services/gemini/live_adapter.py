"""
IP-SAKTI Backend — Gemini Live & Real-Time Voice Adapter
SIH26045

Provides configuration, voice preference mapping, and protocol readiness
for Gemini Live real-time bidirectional voice assistant sessions.
"""
from typing import Dict, Any, List, Optional
from app.services.gemini.config import get_gemini_config


# Voice mapping for Indian languages with Female preference
GEMINI_VOICE_PREFERENCES = {
    "default_female": "Aoede",  # Official Gemini female voice
    "alternate_female": "Kore",
    "fallback_female": "Swara",  # Indian female voice name
}


class GeminiLiveAdapter:
    """
    Adapter for Gemini Live real-time audio and voice interaction.
    """

    def __init__(self):
        self.cfg = get_gemini_config()

    def get_live_session_config(
        self,
        language: str = "kn",
        voice_gender: str = "female"
    ) -> Dict[str, Any]:
        """
        Prepares session configuration for Gemini Live voice conversation.
        """
        is_ready = self.cfg["is_configured"]
        voice_name = GEMINI_VOICE_PREFERENCES.get(f"default_{voice_gender}", "Aoede")

        return {
            "provider": "GEMINI_LIVE",
            "model": self.cfg["live_model"],
            "status": "READY" if is_ready else "NOT_CONFIGURED",
            "voice": {
                "name": voice_name,
                "gender": voice_gender,
                "preferred": True
            },
            "language": language,
            "sampling_rate_hertz": 24000,
            "response_modality": "AUDIO_AND_TEXT",
            "statutory_guardrails": "ACTIVE",
            "notes": (
                "Real-time Gemini Live audio connection ready." if is_ready
                else "GEMINI_API_KEY not configured. Voice pipeline uses verified Web Speech API + Bhashini fallback."
            )
        }


gemini_live_adapter = GeminiLiveAdapter()
