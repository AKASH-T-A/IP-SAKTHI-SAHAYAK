"""
IP-SAKTI Backend — Case-Aware Assistant & Decision Support Endpoint
"""
from fastapi import APIRouter, Body
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.rag.rag_pipeline import RAGPipeline

router = APIRouter()
pipeline = RAGPipeline()


class AssistantQueryRequest(BaseModel):
    query: str
    case_context: Optional[Dict[str, Any]] = None
    language: str = "en"
    jurisdiction: Optional[str] = "India"
    case_id: Optional[str] = None
    conversation_id: Optional[str] = None


class AssistantQueryResponse(BaseModel):
    abstained: bool
    detected_intent: Optional[str] = None
    answer: str
    why: str
    evidence_strength: str
    citations: List[Dict[str, Any]] = []
    missing_information: List[str] = []
    practical_meaning: Optional[str] = None
    next_actions: List[str] = []
    disclaimer: Optional[str] = None
    is_rtl: Optional[bool] = False
    language: Optional[str] = "en"
    provider_used: Optional[str] = None
    citation_validation_status: Optional[str] = None


@router.post("/query", response_model=AssistantQueryResponse)
async def query_assistant(payload: AssistantQueryRequest = Body(...)):
    """
    Grounded case-aware intelligence query with prompt-injection containment,
    Gemini explanation layer, and safe statutory abstention.
    """
    response_data = pipeline.answer_query(
        query=payload.query,
        case_context=payload.case_context,
        language=payload.language
    )
    return AssistantQueryResponse(**response_data)


@router.get("/status")
async def get_assistant_intelligence_status():
    """
    Returns diagnostic and operational readiness of Gemini intelligence and voice layers.
    """
    from app.services.gemini.config import get_gemini_status
    from app.services.voice_provider import voice_manager

    return {
        "service": "IP-SAKTI Case-Aware Intelligence Assistant",
        "gemini": get_gemini_status().dict(),
        "voice": voice_manager.get_status().dict(),
        "rules_engine": "ACTIVE",
        "statutory_corpus": "GAZETTE_VERIFIED",
        "safe_abstention": "ENABLED",
        "languages_supported_count": 23
    }


@router.get("/voice/status")
async def get_voice_assistant_status(language: str = "kn"):
    """
    Returns honest voice provider status for BHASHINI Voice Assistant.
    """
    from app.services.voice_provider import voice_manager
    return voice_manager.get_status(language=language).dict()
