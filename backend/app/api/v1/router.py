"""
IP-SAKTI Backend — API v1 Router
SIH26045
Assembles all endpoint routers under /api/v1/
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, cases, search, assistant, sources,
    regulatory, claims, label_review, expert, graph, evaluation
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(cases.router, prefix="/cases", tags=["Cases"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(sources.router, prefix="/sources", tags=["Sources"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Assistant"])
api_router.include_router(regulatory.router, prefix="/regulatory", tags=["Regulatory Compliance"])
api_router.include_router(claims.router, prefix="/claims", tags=["Advertising & Claims"])
api_router.include_router(label_review.router, prefix="/label", tags=["Label Review"])
api_router.include_router(label_review.router, prefix="/label-review", tags=["Label Review"])
api_router.include_router(expert.router, prefix="/expert", tags=["Expert Escalation"])
api_router.include_router(graph.router, prefix="/graph", tags=["Knowledge Graph"])
api_router.include_router(evaluation.router, prefix="/evaluation", tags=["Jury Evaluation Benchmark"])
