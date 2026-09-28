"""
IP-SAKTI Backend — Advertising & Claims Compliance Scanner
SIH26045

Statutory Sources Grounding:
1. The Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 (§ 3 & Schedule)
2. Drugs and Cosmetics Rules, 1945 — Rule 170
3. Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 — Regulation 8
4. Consumer Protection Act, 2019 — Section 2(28) (Misleading Advertisements)
"""
import re
from fastapi import APIRouter, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

router = APIRouter()

# 54 Schedule disorders under Drugs and Magic Remedies Act 1954
SCHEDULE_BARRED_CONDITIONS = {
    "diabetes": "Diabetes / Madhumeha (Entry 17 in Schedule of Drugs & Magic Remedies Act 1954)",
    "blood sugar": "Diabetes / Blood Sugar Regulation (Entry 17 in Schedule)",
    "cancer": "Cancer / Malignant Neoplasms (Entry 11 in Schedule)",
    "tumour": "Tumours / Arbuda (Entry 11 in Schedule)",
    "sexual": "Sexual Pleasure / Stamina / Impotence (Section 3(b) absolute bar)",
    "impotence": "Impotence / Erectile Dysfunction (Section 3(b) absolute bar)",
    "virility": "Sexual Virility & Enhancement (Section 3(b) absolute bar)",
    "hypertension": "High Blood Pressure / Hypertension (Entry 28 in Schedule)",
    "blood pressure": "High/Low Blood Pressure (Entry 28 in Schedule)",
    "heart": "Heart Diseases / Hrdroga (Entry 27 in Schedule)",
    "cardiac": "Heart Diseases / Cardiac conditions (Entry 27 in Schedule)",
    "epilepsy": "Epilepsy / Apasmara (Entry 19 in Schedule)",
    "kidney stone": "Kidney Stones / Renal Calculi / Ashmari (Entry 32 in Schedule)",
    "renal": "Kidney / Renal Diseases (Entry 32 in Schedule)",
    "liver": "Liver Disorders / Cirrhosis / Yakrit Rog (Entry 35 in Schedule)",
    "jaundice": "Jaundice / Liver disorder (Entry 35 in Schedule)",
    "rheumatism": "Rheumatism / Arthritis / Amavata (Entry 45 in Schedule)",
    "arthritis": "Arthritis / Rheumatoid disorders (Entry 45 in Schedule)",
    "paralysis": "Paralysis / Pakshaghata (Entry 40 in Schedule)",
    "infertility": "Infertility / Conception guarantees (Section 3(c) absolute bar)",
    "miscarriage": "Procurement of Miscarriage (Section 3(a) criminal prohibition)",
    "asthma": "Asthma / Tamaka Shwasa (Entry 5 in Schedule)",
    "obesity": "Obesity / Fat loss / Sthaulya (Entry 39 in Schedule)",
    "weight loss": "Guaranteed rapid weight reduction (Entry 39 in Schedule)",
    "fairness": "Skin color alteration / Fairness guarantees (Consumer Protection Act / ASCI)",
    "baldness": "Baldness / Regrowth guarantees (Entry 7 in Schedule)",
    "cure": "Absolute 'Cure' or '100% Guaranteed' therapeutic claims (Rule 170 / ASCI)",
}

ABSOLUTE_CURE_TERMS = ["100%", "cure", "cures", "permanent cure", "guarantee", "miracle", "eradicate", "completely remove"]


class ClaimScanRequest(BaseModel):
    claim_text: str = Field(..., min_length=3, description="Proposed marketing text or advertisement claim")
    product_category: str = Field(default="Ayurvedic Proprietary Medicine")
    target_media: str = Field(default="Digital / Social Media / Packaging")
    jurisdiction: str = "India"


class ClaimFinding(BaseModel):
    claim_segment: str
    issue_type: str
    risk_level: str  # HIGH_PROHIBITED, REGULATORY_CAUTION, INFORMATIONAL_FLAG
    statutory_authority: str
    cited_act_rule: str
    section_number: str
    statutory_excerpt: str
    recommended_action: str


class ClaimScanResponse(BaseModel):
    original_claim: str
    overall_status: str  # PROHIBITED_CONCERN, CONDITIONAL_REVIEW, PERMISSIBLE_WELLNESS, SAFE_ABSTENTION
    risk_score: str     # HIGH, MODERATE, LOW, UNCERTAIN
    detected_findings: List[ClaimFinding]
    regulatory_frameworks: List[str]
    cautious_summary: str
    official_disclaimer: str


@router.post("/check", response_model=ClaimScanResponse)
async def check_advertising_claim(payload: ClaimScanRequest = Body(...)):
    """
    Statutory scanner evaluating advertising claims against:
    - Drugs and Magic Remedies Act 1954
    - D&C Rules 1945 Rule 170
    - FSSAI Ayurveda Aahar Regulations 2022
    - ASCI Code
    """
    text = payload.claim_text.strip()
    lower_text = text.lower()
    product_cat = payload.product_category.lower()

    findings: List[ClaimFinding] = []

    # 1. Check against Schedule Barred Conditions
    for keyword, condition_desc in SCHEDULE_BARRED_CONDITIONS.items():
        pattern = rf"\b{re.escape(keyword)}\b"
        if re.search(pattern, lower_text):
            # Check if associated with cure or treatment
            has_cure_intent = any(c in lower_text for c in ["cure", "treat", "prevent", "remedy", "mitigate", "manage", "stop", "heal"])
            findings.append(ClaimFinding(
                claim_segment=f"Reference to '{keyword}' in claim: '{text}'",
                issue_type="Prohibited Condition Advertisement",
                risk_level="HIGH_PROHIBITED" if has_cure_intent else "REGULATORY_CAUTION",
                statutory_authority="Central Drugs Standard Control Organisation (CDSCO)",
                cited_act_rule="The Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954",
                section_number="Section 3 & Schedule Entry",
                statutory_excerpt="No person shall take any part in the publication of any advertisement referring to any drug which suggests or leads to the use of that drug for diagnosis, cure, mitigation, treatment or prevention of any disease specified in the Schedule.",
                recommended_action=f"Potential regulatory concern: Avoid therapeutic references to {condition_desc}. Rephrase as supportive wellness without naming schedule disorders."
            ))

    # 2. Check for Absolute Cure Guarantees (Rule 170 & Consumer Protection Act)
    found_cure_terms = [t for t in ABSOLUTE_CURE_TERMS if re.search(rf"\b{re.escape(t)}\b", lower_text)]
    if found_cure_terms:
        findings.append(ClaimFinding(
            claim_segment=f"Absolute guarantee phrasing: '{', '.join(found_cure_terms)}'",
            issue_type="Misleading Therapeutic Guarantee",
            risk_level="HIGH_PROHIBITED",
            statutory_authority="Ministry of Ayush / Advertising Standards Council of India (ASCI)",
            cited_act_rule="Drugs and Cosmetics Rules, 1945 — Rule 170 & Consumer Protection Act 2019 § 2(28)",
            section_number="Rule 170(2)",
            statutory_excerpt="No advertisement shall make misleading or exaggerated therapeutic claims, or promise guaranteed cure for diseases.",
            recommended_action="Remove all absolute guarantees, percentages (100%), and words like 'miracle' or 'permanent cure'. Use cautious phrase: 'Traditionally used to support...'"
        ))

    # 3. Check for Food / Ayurveda Aahar specific bar
    if "aahar" in product_cat or "food" in product_cat or "supplement" in product_cat:
        if any(w in lower_text for w in ["cure", "treat", "prevent", "medicine", "therapeutic", "remedy"]):
            findings.append(ClaimFinding(
                claim_segment="Medicinal/Therapeutic Claim on Food/Ayurveda Aahar",
                issue_type="Strict Statutory Classification Bar",
                risk_level="HIGH_PROHIBITED",
                statutory_authority="Food Safety and Standards Authority of India (FSSAI)",
                cited_act_rule="FSS (Ayurveda Aahar) Regulations, 2022",
                section_number="Regulation 8(2)",
                statutory_excerpt="No person shall label or advertise Ayurveda Aahar with claims for prevention, mitigation, treatment, or cure of any human disease.",
                recommended_action="Remove all medicinal, therapeutic, and preventive disease claims. Ayurveda Aahar is legally confined to dietary and physiological maintenance claims only."
            ))

    # Determine overall status and risk
    has_high = any(f.risk_level == "HIGH_PROHIBITED" for f in findings)
    has_caution = any(f.risk_level == "REGULATORY_CAUTION" for f in findings)

    if has_high:
        overall_status = "PROHIBITED_CONCERN"
        risk_score = "HIGH"
        cautious_summary = "Potential regulatory concern identified under statutory advertising laws. Direct therapeutic or schedule disease claims detected."
    elif has_caution:
        overall_status = "CONDITIONAL_REVIEW"
        risk_score = "MODERATE"
        cautious_summary = "Formulation claim touches on sensitive physiological conditions. Requires qualification with classical citations and State Licensing Authority review."
    else:
        overall_status = "PERMISSIBLE_WELLNESS"
        risk_score = "LOW"
        cautious_summary = "No direct statutory advertising prohibitions detected. Claim appears formatted as general wellness language."

    return ClaimScanResponse(
        original_claim=text,
        overall_status=overall_status,
        risk_score=risk_score,
        detected_findings=findings,
        regulatory_frameworks=[
            "The Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954",
            "Drugs and Cosmetics Rules, 1945 — Rule 170",
            "FSSAI (Ayurveda Aahar) Regulations, 2022",
            "Consumer Protection Act, 2019 (Misleading Advertisements)"
        ],
        cautious_summary=cautious_summary,
        official_disclaimer="Information generated is decision-support intelligence for compliance screening and does not constitute formal legal certification or prior government ad clearance."
    )
