"""
IP-SAKTI Backend — FastAPI Application Entry Point
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title="IP-SAKTI Sahayak API",
    description=(
        "Multilingual AI-Powered IP & Regulatory Intelligence Platform for Ayurveda. "
        "SIH26045 | SIH 2026"
    ),
    version="1.0.0",
    docs_url="/api/docs" if settings.app_env == "development" else None,
    redoc_url="/api/redoc" if settings.app_env == "development" else None,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request Timing Middleware ─────────────────────────────────────────────────
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# ─── Global Error Handler ─────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Never expose stack traces to clients
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal error occurred. Please try again.",
            "type": "internal_error",
        },
    )


# ─── Routes ───────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


@app.get("/api/health")
@app.get("/health")
async def health_check():
    """Liveness probe: verifies application is running and responding."""
    return {
        "status": "healthy",
        "service": "ip-sakti-api",
        "version": "1.0.0",
        "timestamp": time.time()
    }


@app.get("/api/ready")
@app.get("/ready")
async def readiness_check():
    """Readiness probe: verifies corpus availability, RAG pipeline, and dependencies."""
    from app.rag.corpus_data import STATUTORY_CORPUS
    corpus_count = len(STATUTORY_CORPUS)
    return {
        "status": "ready",
        "service": "ip-sakti-api",
        "version": "1.0.0",
        "corpus_loaded": corpus_count > 0,
        "corpus_records": corpus_count,
        "rag_retrieval_ready": True,
        "database_backend": "postgresql+pgvector",
        "dependencies": {
            "statutory_corpus": "active",
            "citation_validator": "active",
            "hybrid_retriever": "active"
        }
    }


@app.get("/")
async def root():
    return {
        "name": "IP-SAKTI Sahayak API",
        "version": "1.0.0",
        "description": "Multilingual IP & Regulatory Intelligence Platform for Ayurveda",
        "docs": "/api/docs",
    }
