"""
IP-SAKTI Backend — Pydantic Schemas
Request/response models for all API endpoints.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from app.models.models import (
    UserRole, CaseStatus, Jurisdiction, SourceType, SourceStatus,
    EvidenceStrength, IPType, ExpertRequestStatus
)


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    language_preference: str = Field(default="en", pattern="^[a-z]{2,3}$")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number.")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserPublic"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserPublic(BaseModel):
    id: UUID
    email: str
    name: str
    role: UserRole
    language_preference: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    language_preference: Optional[str] = Field(None, pattern="^[a-z]{2,3}$")


# ─── Case Schemas ─────────────────────────────────────────────────────────────

class CaseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=500)
    description: Optional[str] = None
    jurisdiction: Jurisdiction = Jurisdiction.india
    language: str = Field(default="en", pattern="^[a-z]{2,3}$")


class CaseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=500)
    description: Optional[str] = None
    status: Optional[CaseStatus] = None
    jurisdiction: Optional[Jurisdiction] = None


class CasePublic(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    status: CaseStatus
    jurisdiction: Jurisdiction
    language: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CaseListResponse(BaseModel):
    items: List[CasePublic]
    total: int
    page: int
    per_page: int


# ─── Formulation Schemas ──────────────────────────────────────────────────────

class Ingredient(BaseModel):
    name: str
    botanical_name: Optional[str] = None
    quantity: Optional[str] = None
    unit: Optional[str] = None
    source: Optional[str] = None  # Wild/Cultivated/Purchased


class FormulationCreate(BaseModel):
    name: Optional[str] = None
    product_type: Optional[str] = None
    dosage_form: Optional[str] = None
    ingredients: Optional[List[Ingredient]] = None
    preparation_method: Optional[str] = None
    classical_basis: Optional[str] = None
    intended_use: Optional[str] = None
    consumer_target: Optional[str] = None
    commercial_intent: Optional[str] = None
    target_market: Optional[str] = None
    traditional_knowledge_flag: bool = False
    biodiversity_flag: bool = False


class FormulationPublic(BaseModel):
    id: UUID
    case_id: UUID
    name: Optional[str]
    product_type: Optional[str]
    dosage_form: Optional[str]
    ingredients: Optional[Any]
    preparation_method: Optional[str]
    classical_basis: Optional[str]
    intended_use: Optional[str]
    consumer_target: Optional[str]
    commercial_intent: Optional[str]
    target_market: Optional[str]
    traditional_knowledge_flag: bool
    biodiversity_flag: bool
    analysis_status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ─── Classification Schemas ───────────────────────────────────────────────────

class ClassificationPublic(BaseModel):
    id: UUID
    case_id: UUID
    classification_type: Optional[str]
    sub_classification: Optional[str]
    rule_ids: Optional[Any]
    candidate_classifications: Optional[Any]
    evidence_strength: Optional[EvidenceStrength]
    ai_explanation: Optional[str]
    missing_information: Optional[Any]
    citations: Optional[Any]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── IP Pathway Schemas ───────────────────────────────────────────────────────

class IPPathwayPublic(BaseModel):
    id: UUID
    case_id: UUID
    ip_type: IPType
    relevance_status: str
    pathway_steps: Optional[Any]
    requirements: Optional[Any]
    evidence_strength: Optional[EvidenceStrength]
    ai_explanation: Optional[str]
    citations: Optional[Any]
    notes: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Source Schemas ───────────────────────────────────────────────────────────

class SourcePublic(BaseModel):
    id: UUID
    title: str
    authority: str
    jurisdiction: Jurisdiction
    source_type: SourceType
    version_label: Optional[str]
    effective_from: Optional[datetime]
    effective_until: Optional[datetime]
    status: SourceStatus
    url: Optional[str]
    authority_rank: int
    ingested_at: datetime

    model_config = {"from_attributes": True}


# ─── Search Schemas ───────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    filters: Optional[dict] = None
    jurisdiction: Optional[Jurisdiction] = None
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=10, ge=1, le=50)


class SearchResultItem(BaseModel):
    id: str
    type: str  # source, case, pathway, regulation
    title: str
    summary: Optional[str]
    relevance_score: float
    metadata: Optional[dict]


class SearchResponse(BaseModel):
    query: str
    intent: Optional[str]
    groups: dict  # {group_label: [SearchResultItem]}
    total: int


# ─── AI Assistant Schemas ─────────────────────────────────────────────────────

class AssistantChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    case_id: Optional[UUID] = None
    language: str = Field(default="en", pattern="^[a-z]{2,3}$")


class Citation(BaseModel):
    source_id: str
    chunk_id: Optional[str]
    title: str
    authority: str
    section: Optional[str]
    quote: Optional[str]
    url: Optional[str]


class AssistantChatResponse(BaseModel):
    answer: str
    why: Optional[str]
    evidence: Optional[List[Citation]]
    what_this_means: Optional[str]
    missing_information: Optional[List[str]]
    recommended_next_steps: Optional[List[str]]
    evidence_strength: EvidenceStrength
    abstained: bool
    language: str
    legal_disclaimer: str = (
        "This platform provides information and decision support only. "
        "It does not constitute legal advice. Consult a qualified professional for legal decisions."
    )


# ─── Expert Request Schemas ───────────────────────────────────────────────────

class ExpertRequestCreate(BaseModel):
    reason: str = Field(..., min_length=10)


class ExpertRequestPublic(BaseModel):
    id: UUID
    case_id: UUID
    reason: str
    status: ExpertRequestStatus
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Generic Response ─────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str
    type: str = "error"
