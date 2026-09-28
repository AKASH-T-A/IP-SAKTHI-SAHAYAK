"""
IP-SAKTI Backend — API v1 Router
Assembles all endpoint routers under /api/v1/
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, cases, search, assistant, sources

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(cases.router, prefix="/cases", tags=["Cases"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(sources.router, prefix="/sources", tags=["Sources"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["AI Assistant"])
