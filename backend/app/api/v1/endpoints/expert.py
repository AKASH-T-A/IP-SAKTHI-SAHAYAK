"""
IP-SAKTI Backend — Human Expert Escalation & Consultation Package Generator
SIH26045

Generates structured legal/regulatory consultation dossiers for attorney review.
Clearly marked: 'Prepared for expert review — not yet submitted to an external expert.'
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Body, HTTPException, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.classification.engine import evaluate_deterministic_classification

router = APIRouter()


class ExpertPackageRequest(BaseModel):
    case_id: Optional[str] = None
    case_title: str = Field(default="Ayurvedic Formulation Evaluation")
    formulation: Dict[str, Any] = Field(default_factory=dict)
    user_questions: List[str] = Field(default_factory=list)
    jurisdiction: str = "India"
    language: str = "en"


class ExpertConsultationPackage(BaseModel):
    package_id: str
    generated_at: str
    case_id: str
    case_title: str
    submission_status: str  # DRAFT_PACKAGE_LOCAL_ONLY
    jurisdiction: str
    formulation_summary: Dict[str, Any]
    ai_classification_findings: List[Dict[str, Any]]
    statutory_citations: List[Dict[str, Any]]
    identified_evidence_gaps: List[str]
    questions_for_expert: List[str]
    ai_confidence_strength: str
    markdown_dossier: str
    disclaimer: str


@router.post("/consultation-package", response_model=ExpertConsultationPackage)
async def generate_expert_package(payload: ExpertPackageRequest = Body(...)):
    """
    Generates a structured, evidence-grounded Expert Consultation Package
    ready for review by an accredited IP Attorney or AYUSH Regulatory Facilitator.
    """
    pkg_id = f"EXP-PKG-{uuid.uuid4().hex[:8].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    cid = payload.case_id or f"case-{uuid.uuid4().hex[:6]}"

    eval_result = evaluate_deterministic_classification(payload.formulation)

    ingredients = payload.formulation.get("ingredients", [])
    ing_names = [i.get("name", "Herb") for i in ingredients if isinstance(i, dict)]

    candidates = eval_result.get("candidate_classifications", [])
    top_cand = candidates[0] if candidates else {"name": "Uncertain / Under Review", "confidence": "LIMITED_EVIDENCE"}

    citations = [
        {"id": "PATENTS_ACT_SEC_3P", "short_title": "Patents Act 1970 § 3(p)", "authority": "Indian Patent Office"},
        {"id": "DC_RULES_158B", "short_title": "D&C Rules 1945 Rule 158B", "authority": "Ministry of Ayush"},
        {"id": "BIO_DIVERSITY_ACT_SEC_7", "short_title": "Biological Diversity Act 2002 § 7", "authority": "State Biodiversity Board"}
    ]

    gaps = [
        "Pharmacopoeial heavy metal and pesticide residue test Certificate of Analysis (CoA)",
        "Documented source trace proving cultivated vs. wild-harvested origin for SBB exemption review",
        "Empirical synergy data (Combination Index < 1.0) to address Patent Section 3(p) objection"
    ]

    questions = payload.user_questions or [
        "1. Does the technical extraction data adequately overcome the Section 3(p) Traditional Knowledge bar for patentability?",
        "2. Can the product be commercialized under Rule 158B as an Ayurvedic Proprietary Medicine, or should it proceed under FSSAI Ayurveda Aahar?",
        "3. What are the specific State Biodiversity Board (SBB) benefit-sharing liability implications given the procurement channel?",
    ]

    # Generate Markdown consultation dossier
    md_content = f"""# IP-SAKTI SAHAYAK — EXPERT CONSULTATION PACKAGE
**Package ID:** `{pkg_id}` | **Date:** {now_iso}
**Case Reference:** {payload.case_title} (`{cid}`)
**Status:** DRAFT PREPARED FOR EXPERT REVIEW — NOT SUBMITTED EXTERNALLY

---

## 1. Executive Summary & Formulation
- **Product Title:** {payload.case_title}
- **Jurisdiction:** {payload.jurisdiction}
- **Ingredients Declared:** {', '.join(ing_names) if ing_names else 'Not specified'}
- **Primary AI Classification:** {top_cand.get('name', 'Under Review')}
- **Evidence Confidence Level:** {top_cand.get('confidence', 'MODERATE_EVIDENCE')}

## 2. Applicable Statutory Regimes
1. **The Patents Act, 1970:** Section 3(p) [Traditional Knowledge Bar] & Section 3(e) [Aggregation Bar]
2. **Drugs & Cosmetics Rules, 1945:** Rule 158B [Proprietary Medicine Licensing Criteria]
3. **The Biological Diversity Act, 2002:** Section 6 [NBA Patent Approval] & Section 7 [SBB Prior Intimation]

## 3. Identified Evidence Gaps
{chr(10).join(f"- [ ] {g}" for g in gaps)}

## 4. Specific Legal Questions Requiring Human Expert Advice
{chr(10).join(f"- {q}" for q in questions)}

---
> **MANDATORY STATUTORY DISCLAIMER:**
> This document was synthesized by IP-SAKTI Sahayak algorithmic decision-support architecture.
> It does not constitute formal legal counsel, patent attorney work product, or granted regulatory certification.
"""

    return ExpertConsultationPackage(
        package_id=pkg_id,
        generated_at=now_iso,
        case_id=cid,
        case_title=payload.case_title,
        submission_status="DRAFT_PACKAGE_LOCAL_ONLY",
        jurisdiction=payload.jurisdiction,
        formulation_summary={
            "product_category": payload.formulation.get("product_category", "Ayurvedic formulation"),
            "ingredients_count": len(ingredients),
            "ingredient_names": ing_names,
            "is_classical": payload.formulation.get("is_classical", False),
        },
        ai_classification_findings=candidates,
        statutory_citations=citations,
        identified_evidence_gaps=gaps,
        questions_for_expert=questions,
        ai_confidence_strength=top_cand.get("confidence", "MODERATE_EVIDENCE"),
        markdown_dossier=md_content,
        disclaimer="Prepared for expert review — not yet submitted to an external expert. IP-SAKTI provides decision-support intelligence and does not replace accredited legal counsel."
    )
