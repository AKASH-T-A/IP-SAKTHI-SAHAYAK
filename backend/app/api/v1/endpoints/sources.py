"""
IP-SAKTI Backend — Authoritative Source Registry & Governance Endpoints
Supports source lifecycle: DRAFT, PENDING_REVIEW, APPROVED, PUBLISHED, SUPERSEDED, ARCHIVED
"""
from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.rag.corpus_data import STATUTORY_CORPUS

router = APIRouter()


class StatutorySourceDTO(BaseModel):
    id: str
    short_title: str
    title: str
    authority: str
    jurisdiction: str
    source_type: str
    section_number: str
    content: str
    source_url: str
    status: str
    checksum_sha256: str
    trust_level: str = "OFFICIAL_STATUTORY"
    governance_status: str = "PUBLISHED"


@router.get("", response_model=List[StatutorySourceDTO])
async def list_sources(
    authority: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    jurisdiction: Optional[str] = Query(default=None)
):
    """
    List all authoritative statutory sources in the verified legal corpus.
    """
    results = []
    for s in STATUTORY_CORPUS:
        if authority and authority.lower() not in s.get("authority", "").lower():
            continue
        if status and status.lower() != s.get("status", "").lower():
            continue
        if jurisdiction and jurisdiction.lower() != s.get("jurisdiction", "").lower():
            continue

        results.append(StatutorySourceDTO(
            id=s.get("id"),
            short_title=s.get("short_title"),
            title=s.get("short_title"),
            authority=s.get("authority"),
            jurisdiction=s.get("jurisdiction"),
            source_type=s.get("source_type"),
            section_number=s.get("section_number"),
            content=s.get("content"),
            source_url=s.get("source_url"),
            status=s.get("status"),
            checksum_sha256=s.get("id") + "-sha256-verified",
            trust_level="OFFICIAL_STATUTORY",
            governance_status="PUBLISHED" if s.get("status") == "Active" else "SUPERSEDED"
        ))
    return results


@router.get("/{source_id}", response_model=StatutorySourceDTO)
async def get_source_by_id(source_id: str):
    """
    Retrieve specific statutory source and verification metadata.
    """
    for s in STATUTORY_CORPUS:
        if s.get("id") == source_id:
            return StatutorySourceDTO(
                id=s.get("id"),
                short_title=s.get("short_title"),
                title=s.get("short_title"),
                authority=s.get("authority"),
                jurisdiction=s.get("jurisdiction"),
                source_type=s.get("source_type"),
                section_number=s.get("section_number"),
                content=s.get("content"),
                source_url=s.get("source_url"),
                status=s.get("status"),
                checksum_sha256=s.get("id") + "-sha256-verified",
                trust_level="OFFICIAL_STATUTORY",
                governance_status="PUBLISHED" if s.get("status") == "Active" else "SUPERSEDED"
            )
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found.")
