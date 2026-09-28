"""
IP-SAKTI Sahayak — Backend Deterministic Classification & Safe Abstention Engine
SIH26045

Implements:
1. Formulation entity extraction
2. Deterministic statutory rules (Section 3(p) Patents Act, Rule 158B D&C Act, BDA 2002)
3. Safe Abstention detection
4. Evidence strength assessment
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field


@dataclass
class CandidateClassification:
    id: str
    name: str
    confidence: str  # HIGH_EVIDENCE, MODERATE_EVIDENCE, LIMITED_EVIDENCE, INSUFFICIENT_EVIDENCE
    rule_identifier: str
    triggered_conditions: List[str]
    missing_information: List[str]
    evidence_requirements: List[str]


@dataclass
class SafeAbstentionResult:
    is_abstained: bool
    trigger_category: Optional[str] = None
    reason: Optional[str] = None
    missing_fields: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)


def evaluate_safe_abstention(formulation: Dict[str, Any]) -> SafeAbstentionResult:
    """Detects missing essential parameters to withhold speculation."""
    missing = []
    ingredients = formulation.get("ingredients", [])

    if not ingredients:
        missing.append("Active Botanical / Herbo-Mineral Ingredients")

    intended_use = formulation.get("intended_use", "").strip()
    if not intended_use:
        missing.append("Intended Indication or Functional Claim")

    target_jurisdiction = formulation.get("target_jurisdiction", "").strip()
    if not target_jurisdiction:
        missing.append("Target Regulatory Jurisdiction")

    if missing:
        return SafeAbstentionResult(
            is_abstained=True,
            trigger_category="MISSING_CRITICAL_INFO",
            reason="IP-SAKTI does not have sufficient authoritative evidence to evaluate this case reliably due to missing core formulation parameters.",
            missing_fields=missing,
            recommendations=[
                "Provide verified botanical names and plant parts used.",
                "Specify therapeutic vs dietary claims boundaries.",
            ]
        )

    return SafeAbstentionResult(is_abstained=False)


def evaluate_deterministic_classification(formulation: Dict[str, Any]) -> Dict[str, Any]:
    """Generates candidate classifications, IP pathways, and regulatory requirements."""
    abstention = evaluate_safe_abstention(formulation)
    if abstention.is_abstained:
        return {
            "status": "ABSTAINED",
            "safe_abstention": {
                "is_abstained": True,
                "reason": abstention.reason,
                "missing_fields": abstention.missing_fields,
                "recommendations": abstention.recommendations,
            },
            "candidate_classifications": [],
            "ip_pathways": [],
            "regulatory_pathways": [],
        }

    ingredients = formulation.get("ingredients", [])
    claims_type = formulation.get("claims_type", [])
    is_classical = formulation.get("is_classical", False)

    candidates = []

    # 1. Therapeutic Claims
    claims_therapeutic = any("Therapeutic" in c or "Medicinal" in c for c in claims_type)
    if claims_therapeutic:
        candidates.append(CandidateClassification(
            id="CLASSICAL_ASU_DRUG" if is_classical else "PROPRIETARY_ASU_DRUG",
            name="Candidate Classical Ayurvedic Medicine" if is_classical else "Candidate Ayurvedic Proprietary Medicine (D&C Act Rule 158B)",
            confidence="HIGH_EVIDENCE" if len(ingredients) > 0 else "MODERATE_EVIDENCE",
            rule_identifier="RULE_DC_ACT_SEC_3A" if is_classical else "RULE_DC_ACT_RULE_158B",
            triggered_conditions=[
                "Asset: " + formulation.get("product_category", "Ayurvedic formulation"),
                "Therapeutic indications declared",
            ],
            missing_information=["Pharmacopoeial batch testing CoA"],
            evidence_requirements=["Schedule T GMP certification from State AYUSH Licensing Authority"]
        ))

    # 2. IP Patent Section 3(p) Analysis
    has_known_herb = any(i.get("name") for i in ingredients)
    ip_eval = {
        "category": "Patent",
        "section_3p_applicable": has_known_herb,
        "section_3p_caveat": "Traditional herbal uses cannot be patented as aggregations per Section 3(p). Technical synergy data is required.",
        "statutory_statute": "The Patents Act, 1970 § 3(p)"
    }

    # 3. ABS / BDA 2002 Analysis
    uses_bio_resources = any(i.get("source_type") != "imported" for i in ingredients)
    abs_eval = {
        "triggers_sbb_section_7": uses_bio_resources,
        "triggers_nba_section_6": True,  # For patent filings
        "statutory_statute": "The Biological Diversity Act, 2002 § 6 & § 7"
    }

    return {
        "status": "EVALUATED",
        "safe_abstention": {"is_abstained": False},
        "candidate_classifications": [
            {
                "id": c.id,
                "name": c.name,
                "confidence": c.confidence,
                "rule_identifier": c.rule_identifier,
                "triggered_conditions": c.triggered_conditions,
                "missing_information": c.missing_information,
                "evidence_requirements": c.evidence_requirements,
            }
            for c in candidates
        ],
        "ip_evaluation": ip_eval,
        "abs_evaluation": abs_eval,
    }
