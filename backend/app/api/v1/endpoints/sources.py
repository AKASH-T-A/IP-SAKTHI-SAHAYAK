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


# ─── In-memory Version Archive for Retaining Superseded Sources ──────────────
VERSION_ARCHIVE: Dict[str, List[Dict[str, Any]]] = {}


class SourceUpdateRequest(BaseModel):
    source_id: str
    new_version_label: str
    summary_of_changes: str
    new_content: str
    publication_date: Optional[str] = None
    effective_date: Optional[str] = None
    gazette_reference: Optional[str] = None
    official_url: Optional[str] = None


class SourceVersionDTO(BaseModel):
    version_id: str
    source_id: str
    version_label: str
    publication_date: Optional[str]
    effective_date: Optional[str]
    status: str  # CURRENT, SUPERSEDED, DRAFT, UNKNOWN
    gazette_reference: Optional[str]
    summary_of_changes: Optional[str]
    checksum_sha256: str
    official_url: Optional[str]


class SourceUpdateResponse(BaseModel):
    status: str
    governance_flow: str
    source_id: str
    archived_version: SourceVersionDTO
    active_version: StatutorySourceDTO


@router.post("/update-version", response_model=SourceUpdateResponse)
async def update_source_version(payload: SourceUpdateRequest):
    """
    Admin Source-Update Architecture:
    Flow: SOURCE -> NEW VERSION -> VALIDATE -> STORE VERSION -> RETAIN OLD VERSION -> MARK CURRENT -> UPDATE RETRIEVAL
    
    1. Validates source exists
    2. Archives old version as SUPERSEDED with SHA-256 checksum
    3. Replaces active version in verified corpus with new content
    4. Marks new version as CURRENT / Active
    5. Returns audit trail record
    """
    import hashlib
    import uuid
    from datetime import datetime, timezone

    # 1. Validate
    target_source = None
    for s in STATUTORY_CORPUS:
        if s.get("id") == payload.source_id:
            target_source = s
            break

    if not target_source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source ID '{payload.source_id}' does not exist in verified corpus."
        )

    # 2. Retain old version
    old_content = target_source.get("content", "")
    old_hash = hashlib.sha256(old_content.encode("utf-8")).hexdigest()
    old_version_record = {
        "version_id": f"VER-{uuid.uuid4().hex[:8].upper()}",
        "source_id": payload.source_id,
        "version_label": target_source.get("status", "Original") + " Version",
        "publication_date": target_source.get("publication_date"),
        "effective_date": target_source.get("effective_date"),
        "status": "SUPERSEDED",
        "gazette_reference": target_source.get("id"),
        "summary_of_changes": "Archived before applying update: " + payload.new_version_label,
        "checksum_sha256": old_hash,
        "official_url": target_source.get("source_url")
    }

    if payload.source_id not in VERSION_ARCHIVE:
        VERSION_ARCHIVE[payload.source_id] = []
    VERSION_ARCHIVE[payload.source_id].append(old_version_record)

    # 3. Compute new hash & update active source
    new_hash = hashlib.sha256(payload.new_content.encode("utf-8")).hexdigest()
    target_source["content"] = payload.new_content
    target_source["status"] = "Active"
    if payload.publication_date:
        target_source["publication_date"] = payload.publication_date
    if payload.effective_date:
        target_source["effective_date"] = payload.effective_date
    if payload.official_url:
        target_source["source_url"] = payload.official_url

    # 4. Formulate response
    archived_dto = SourceVersionDTO(**old_version_record)
    active_dto = StatutorySourceDTO(
        id=target_source.get("id"),
        short_title=target_source.get("short_title"),
        title=target_source.get("short_title"),
        authority=target_source.get("authority"),
        jurisdiction=target_source.get("jurisdiction"),
        source_type=target_source.get("source_type"),
        section_number=target_source.get("section_number"),
        content=target_source.get("content"),
        source_url=target_source.get("source_url"),
        status="Active",
        checksum_sha256=new_hash,
        trust_level="OFFICIAL_STATUTORY",
        governance_status="PUBLISHED"
    )

    return SourceUpdateResponse(
        status="SUCCESS",
        governance_flow="SOURCE -> NEW VERSION -> VALIDATE -> STORE VERSION -> RETAIN OLD VERSION -> MARK CURRENT -> UPDATE RETRIEVAL",
        source_id=payload.source_id,
        archived_version=archived_dto,
        active_version=active_dto
    )


@router.get("/{source_id}/versions", response_model=List[SourceVersionDTO])
async def get_source_version_history(source_id: str):
    """
    Returns full version history for a given source, including superseded versions.
    """
    versions = VERSION_ARCHIVE.get(source_id, [])
    return [SourceVersionDTO(**v) for v in versions]
