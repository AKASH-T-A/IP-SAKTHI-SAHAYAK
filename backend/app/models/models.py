"""
IP-SAKTI Backend — SQLAlchemy ORM Models
All core entities with proper relationships, soft-delete, audit timestamps.
"""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    String, Text, Boolean, Integer, Float, DateTime, ForeignKey,
    Enum as SAEnum, JSON, Index, Uuid
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB as PG_JSONB
from sqlalchemy.sql import func
import enum
from pgvector.sqlalchemy import Vector
from app.db.session import Base

# Cross-dialect types: Native PostgreSQL in prod, standard Uuid/JSON in SQLite dev/testing
def UUID(as_uuid: bool = True):
    return PG_UUID(as_uuid=as_uuid).with_variant(Uuid(as_uuid=as_uuid), "sqlite")

JSONB = PG_JSONB().with_variant(JSON(), "sqlite")


# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    admin = "admin"
    expert = "expert"
    user = "user"
    readonly = "readonly"


class CaseStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    completed = "completed"
    archived = "archived"


class Jurisdiction(str, enum.Enum):
    india = "India"
    international = "International"
    eu = "EU"
    us = "US"


class SourceType(str, enum.Enum):
    act = "Act"
    rule = "Rule"
    regulation = "Regulation"
    notification = "Notification"
    treaty = "Treaty"
    guidance = "Guidance"
    tk_evidence = "TK Evidence"
    patent = "Patent"


class SourceStatus(str, enum.Enum):
    active = "Active"
    superseded = "Superseded"
    repealed = "Repealed"
    draft = "Draft"
    unknown = "Unknown"


class EvidenceStrength(str, enum.Enum):
    high = "High"
    moderate = "Moderate"
    low = "Low"
    insufficient = "Insufficient"


class IPType(str, enum.Enum):
    patent = "Patent"
    trademark = "Trademark"
    gi = "Geographical Indication"
    copyright = "Copyright"
    design = "Industrial Design"
    pvp = "Plant Variety Protection"


class ExpertRequestStatus(str, enum.Enum):
    pending = "Pending"
    assigned = "Assigned"
    resolved = "Resolved"


# ─── Base Mixin ───────────────────────────────────────────────────────────────

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


# ─── User & Auth ──────────────────────────────────────────────────────────────

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.user)
    language_preference: Mapped[str] = mapped_column(String(10), default="en")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    cases: Mapped[List["Case"]] = relationship("Case", back_populates="user")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user")


# ─── Cases ────────────────────────────────────────────────────────────────────

class Case(Base, TimestampMixin):
    __tablename__ = "cases"
    __table_args__ = (
        Index("ix_cases_user_active", "user_id", "deleted_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[CaseStatus] = mapped_column(SAEnum(CaseStatus), default=CaseStatus.draft)
    jurisdiction: Mapped[Jurisdiction] = mapped_column(SAEnum(Jurisdiction), default=Jurisdiction.india)
    language: Mapped[str] = mapped_column(String(10), default="en")
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="cases")
    formulation: Mapped[Optional["Formulation"]] = relationship("Formulation", back_populates="case", uselist=False)
    classifications: Mapped[List["Classification"]] = relationship("Classification", back_populates="case")
    ip_pathways: Mapped[List["IPPathway"]] = relationship("IPPathway", back_populates="case")
    documents: Mapped[List["Document"]] = relationship("Document", back_populates="case")
    responses: Mapped[List["Response"]] = relationship("Response", back_populates="case")
    expert_requests: Mapped[List["ExpertRequest"]] = relationship("ExpertRequest", back_populates="case")
    gaps: Mapped[List["EvidenceGap"]] = relationship("EvidenceGap", back_populates="case")
    reports: Mapped[List["CaseReport"]] = relationship("CaseReport", back_populates="case")
    assistant_sessions: Mapped[List["AssistantSession"]] = relationship("AssistantSession", back_populates="case")


# ─── Formulation ──────────────────────────────────────────────────────────────

class Formulation(Base, TimestampMixin):
    __tablename__ = "formulations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), unique=True, nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(500))
    product_type: Mapped[Optional[str]] = mapped_column(String(100))  # Classical/Modified/Novel/Proprietary
    dosage_form: Mapped[Optional[str]] = mapped_column(String(100))   # Tablet/Churna/Oil/etc
    ingredients: Mapped[Optional[dict]] = mapped_column(JSONB)        # [{name, botanical, quantity, source}]
    preparation_method: Mapped[Optional[str]] = mapped_column(Text)
    classical_basis: Mapped[Optional[str]] = mapped_column(Text)
    intended_use: Mapped[Optional[str]] = mapped_column(Text)
    consumer_target: Mapped[Optional[str]] = mapped_column(String(200))
    commercial_intent: Mapped[Optional[str]] = mapped_column(String(100))
    target_market: Mapped[Optional[str]] = mapped_column(String(200))
    traditional_knowledge_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    biodiversity_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    analysis_status: Mapped[str] = mapped_column(String(50), default="pending")  # pending/analyzing/complete

    case: Mapped["Case"] = relationship("Case", back_populates="formulation")


# ─── Classification ───────────────────────────────────────────────────────────

class Classification(Base, TimestampMixin):
    __tablename__ = "classifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    classification_type: Mapped[Optional[str]] = mapped_column(String(200))
    sub_classification: Mapped[Optional[str]] = mapped_column(String(200))
    rule_ids: Mapped[Optional[list]] = mapped_column(JSONB)          # list of rule IDs applied
    candidate_classifications: Mapped[Optional[dict]] = mapped_column(JSONB)  # all candidates with scores
    evidence_strength: Mapped[Optional[EvidenceStrength]] = mapped_column(SAEnum(EvidenceStrength))
    ai_explanation: Mapped[Optional[str]] = mapped_column(Text)
    missing_information: Mapped[Optional[dict]] = mapped_column(JSONB)
    citations: Mapped[Optional[dict]] = mapped_column(JSONB)

    case: Mapped["Case"] = relationship("Case", back_populates="classifications")


# ─── IP Pathway ───────────────────────────────────────────────────────────────

class IPPathway(Base, TimestampMixin):
    __tablename__ = "ip_pathways"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    ip_type: Mapped[IPType] = mapped_column(SAEnum(IPType), nullable=False)
    relevance_status: Mapped[str] = mapped_column(String(50), default="Possibly Relevant")
    pathway_steps: Mapped[Optional[dict]] = mapped_column(JSONB)
    requirements: Mapped[Optional[dict]] = mapped_column(JSONB)
    evidence_strength: Mapped[Optional[EvidenceStrength]] = mapped_column(SAEnum(EvidenceStrength))
    ai_explanation: Mapped[Optional[str]] = mapped_column(Text)
    citations: Mapped[Optional[dict]] = mapped_column(JSONB)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    case: Mapped["Case"] = relationship("Case", back_populates="ip_pathways")


# ─── Sources (Knowledge Corpus) ───────────────────────────────────────────────

class Source(Base):
    __tablename__ = "sources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    authority: Mapped[str] = mapped_column(String(200), nullable=False)
    jurisdiction: Mapped[Jurisdiction] = mapped_column(SAEnum(Jurisdiction), nullable=False)
    source_type: Mapped[SourceType] = mapped_column(SAEnum(SourceType), nullable=False)
    version_label: Mapped[Optional[str]] = mapped_column(String(200))
    effective_from: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    effective_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status: Mapped[SourceStatus] = mapped_column(SAEnum(SourceStatus), default=SourceStatus.unknown)
    url: Mapped[Optional[str]] = mapped_column(String(1000))
    document_hash: Mapped[Optional[str]] = mapped_column(String(64))  # SHA-256
    retrieved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    ingested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    parent_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("sources.id"))
    authority_rank: Mapped[int] = mapped_column(Integer, default=5)  # 1=highest (Act), 7=lowest

    chunks: Mapped[List["SourceChunk"]] = relationship("SourceChunk", back_populates="source")
    versions: Mapped[List["SourceVersion"]] = relationship("SourceVersion", back_populates="source")
    parent_version: Mapped[Optional["Source"]] = relationship("Source", remote_side="Source.id")


class SourceChunk(Base):
    """Individual retrievable chunk from a source document."""
    __tablename__ = "source_chunks"
    __table_args__ = (
        Index("ix_source_chunks_source", "source_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    legal_path: Mapped[Optional[str]] = mapped_column(String(500))    # "Act > Chapter 2 > Section 3"
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    token_count: Mapped[Optional[int]] = mapped_column(Integer)
    # pgvector 1536-dim vector for semantic similarity
    embedding = mapped_column(Vector(1536), nullable=True)
    embedding_json: Mapped[Optional[str]] = mapped_column(Text)
    bm25_tokens: Mapped[Optional[str]] = mapped_column(Text)          # for keyword index
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    source: Mapped["Source"] = relationship("Source", back_populates="chunks")


# ─── Documents (User Uploads) ─────────────────────────────────────────────────

class Document(Base, TimestampMixin):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    filename_sanitized: Mapped[str] = mapped_column(String(500), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    storage_key: Mapped[str] = mapped_column(String(1000), nullable=False)
    extraction_status: Mapped[str] = mapped_column(String(50), default="pending")
    extracted_text: Mapped[Optional[str]] = mapped_column(Text)

    case: Mapped["Case"] = relationship("Case", back_populates="documents")


# ─── AI Responses ─────────────────────────────────────────────────────────────

class Response(Base):
    __tablename__ = "responses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    query_intent: Mapped[Optional[str]] = mapped_column(String(100))
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    evidence_strength: Mapped[Optional[EvidenceStrength]] = mapped_column(SAEnum(EvidenceStrength))
    citations: Mapped[Optional[dict]] = mapped_column(JSONB)
    missing_information: Mapped[Optional[dict]] = mapped_column(JSONB)
    abstained: Mapped[bool] = mapped_column(Boolean, default=False)
    language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    case: Mapped[Optional["Case"]] = relationship("Case", back_populates="responses")


# ─── Audit Logs ───────────────────────────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_user_time", "user_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    action: Mapped[str] = mapped_column(String(200), nullable=False)
    resource_type: Mapped[Optional[str]] = mapped_column(String(100))
    resource_id: Mapped[Optional[str]] = mapped_column(String(100))
    log_metadata: Mapped[Optional[dict]] = mapped_column(JSONB)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[Optional["User"]] = relationship("User", back_populates="audit_logs")


# ─── Expert Requests ──────────────────────────────────────────────────────────

class ExpertRequest(Base, TimestampMixin):
    __tablename__ = "expert_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ExpertRequestStatus] = mapped_column(SAEnum(ExpertRequestStatus), default=ExpertRequestStatus.pending)
    assigned_to: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text)

    case: Mapped["Case"] = relationship("Case", back_populates="expert_requests")


# ─── Source Versions & Diff Tracking (Regulatory Time Machine) ────────────────

class SourceVersion(Base, TimestampMixin):
    __tablename__ = "source_versions"
    __table_args__ = (
        Index("ix_source_versions_source_status", "source_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sources.id"), nullable=False)
    version_number: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., "2002.1", "2023.Amd"
    version_label: Mapped[str] = mapped_column(String(200), nullable=False)   # e.g., "Original Enactment", "2023 Amendment"
    publication_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    effective_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status: Mapped[SourceStatus] = mapped_column(SAEnum(SourceStatus), default=SourceStatus.active)
    gazette_reference: Mapped[Optional[str]] = mapped_column(String(300))
    summary_of_changes: Mapped[Optional[str]] = mapped_column(Text)
    diff_clauses: Mapped[Optional[dict]] = mapped_column(JSONB)   # {"added": [...], "removed": [...], "modified": [...]}
    official_url: Mapped[Optional[str]] = mapped_column(String(1000))
    hash_sha256: Mapped[Optional[str]] = mapped_column(String(64))

    source: Mapped["Source"] = relationship("Source", back_populates="versions")


# ─── Evidence Gaps ─────────────────────────────────────────────────────────────

class EvidenceGap(Base, TimestampMixin):
    __tablename__ = "evidence_gaps"
    __table_args__ = (
        Index("ix_evidence_gaps_case_status", "case_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    gap_key: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    why_it_matters: Mapped[str] = mapped_column(Text, nullable=False)
    what_to_provide: Mapped[str] = mapped_column(Text, nullable=False)
    decision_affected: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="open")  # open / resolved / acknowledged

    case: Mapped["Case"] = relationship("Case", back_populates="gaps")


# ─── Case Dossiers / Reports ──────────────────────────────────────────────────

class CaseReport(Base, TimestampMixin):
    __tablename__ = "case_reports"
    __table_args__ = (
        Index("ix_case_reports_case_time", "case_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    report_reference: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    report_type: Mapped[str] = mapped_column(String(50), default="comprehensive_intelligence_dossier")
    status: Mapped[str] = mapped_column(String(50), default="generated")
    snapshot_dna: Mapped[Optional[dict]] = mapped_column(JSONB)
    executive_summary: Mapped[Optional[str]] = mapped_column(Text)
    report_payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    corpus_version_hash: Mapped[Optional[str]] = mapped_column(String(64))
    disclaimers: Mapped[Optional[str]] = mapped_column(Text)

    case: Mapped["Case"] = relationship("Case", back_populates="reports")


# ─── Case-Aware Assistant Sessions & Messages ─────────────────────────────────

class AssistantSession(Base, TimestampMixin):
    __tablename__ = "assistant_sessions"
    __table_args__ = (
        Index("ix_assistant_sessions_user_case", "user_id", "case_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    case_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(300), default="Case Decision Session")
    language_code: Mapped[str] = mapped_column(String(10), default="en")

    case: Mapped[Optional["Case"]] = relationship("Case", back_populates="assistant_sessions")
    messages: Mapped[List["AssistantMessage"]] = relationship("AssistantMessage", back_populates="session", cascade="all, delete-orphan")


class AssistantMessage(Base):
    __tablename__ = "assistant_messages"
    __table_args__ = (
        Index("ix_assistant_messages_session_time", "session_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("assistant_sessions.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user / assistant / system
    content: Mapped[str] = mapped_column(Text, nullable=False)
    structured_sections: Mapped[Optional[dict]] = mapped_column(JSONB)  # answer, why, evidence, missing, next_actions, etc.
    detected_intent: Mapped[Optional[str]] = mapped_column(String(100))
    language_code: Mapped[str] = mapped_column(String(10), default="en")
    citations: Mapped[Optional[dict]] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped["AssistantSession"] = relationship("AssistantSession", back_populates="messages")

