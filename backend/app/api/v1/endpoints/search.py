"""
IP-SAKTI Backend — Statutory Search & Retrieval Endpoints
Grounded in hybrid BM25 + Vector retrieval + Reciprocal Rank Fusion
"""
from fastapi import APIRouter, Query, Depends
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.rag.rag_pipeline import RAGPipeline
from app.rag.corpus_data import STATUTORY_CORPUS

router = APIRouter()
pipeline = RAGPipeline()


class SearchResponse(BaseModel):
    query: str
    detected_intent: str
    total_results: int
    results: List[Dict[str, Any]]


@router.get("", response_model=SearchResponse)
async def search_statutes(
    q: str = Query(..., min_length=1, description="Statutory query or formulation concept"),
    top_k: int = Query(default=5, ge=1, le=20),
    jurisdiction: str = Query(default="India"),
    authority: Optional[str] = Query(default=None)
):
    """
    Execute hybrid search over official statutory legal corpus.
    """
    intent = pipeline.classify_intent(q)
    results = pipeline.retrieve(
        query=q,
        top_k=top_k,
        jurisdiction=jurisdiction,
        authority=authority
    )
    return SearchResponse(
        query=q,
        detected_intent=intent,
        total_results=len(results),
        results=results
    )
