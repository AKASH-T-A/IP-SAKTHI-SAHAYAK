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


@router.post("/query", response_model=AssistantQueryResponse)
async def query_assistant(payload: AssistantQueryRequest = Body(...)):
    """
    Grounded case-aware intelligence query with prompt-injection containment and safe abstention.
    """
    response_data = pipeline.answer_query(
        query=payload.query,
        case_context=payload.case_context,
        language=payload.language
    )
    return AssistantQueryResponse(**response_data)
