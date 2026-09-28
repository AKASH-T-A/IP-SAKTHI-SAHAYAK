"""
IP-SAKTI Backend — Label Compliance & Review Helper
SIH26045

Statutory Grounding:
- Drugs and Cosmetics Rules, 1945 — Rule 161 (Manner of labelling of ASU drugs)
- Schedule E(1) of Drugs and Cosmetics Rules, 1945 (List of poisonous substances requiring medical supervision warning)
- Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 — Regulation 8
"""
import re
from fastapi import APIRouter, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

router = APIRouter()

# Schedule E(1) Poisonous Herbal & Mineral Actives
SCHEDULE_E1_HERBS = [
    "vatsanabha", "aconitum", "kupilu", "strychnos", "nux vomica",
    "bhang", "cannabis", "ganja", "bhallataka", "semecarpus",
    "dhatura", "datura", "gunja", "abrus", "ahiphena", "opium",
    "shringika", "langali", "gloriosa", "jayapala", "croton"
]


class LabelReviewRequest(BaseModel):
    label_text: str = Field(..., min_length=5, description="Transcribed or extracted label text from product package")
    product_category: str = Field(default="Ayurvedic Proprietary Medicine")
    dosage_form: Optional[str] = "Churna / Capsule / Oil"
    jurisdiction: str = "India"


class LabelFieldStatus(BaseModel):
    field_name: str
    is_detected: bool
    detected_value: Optional[str] = None
    statutory_rule: str
    status: str  # COMPLIANT, MISSING_REQUIRED, POTENTIALLY_REQUIRED, NEEDS_VERIFICATION
    guidance: str


class LabelReviewResponse(BaseModel):
    product_category: str
    compliance_score_percent: int
    fields_evaluated: List[LabelFieldStatus]
    schedule_e1_warning_required: bool
    schedule_e1_detected_herbs: List[str]
    critical_missing: List[str]
    statutory_citations: List[Dict[str, Any]]
    recommendations: List[str]
    disclaimer: str


@router.post("/review", response_model=LabelReviewResponse)
async def review_product_label(payload: LabelReviewRequest = Body(...)):
    """
    Evaluates a transcribed or extracted product label against:
    - Drugs and Cosmetics Rules, 1945 Rule 161
    - Schedule E(1) Cautionary Warnings
    - FSSAI Ayurveda Aahar Regulation 8
    """
    text = payload.label_text
    lower = text.lower()
    is_food = "aahar" in payload.product_category.lower() or "food" in payload.product_category.lower()

    fields_eval: List[LabelFieldStatus] = []
    missing_critical: List[str] = []

    # 1. Product Name
    has_name = bool(re.search(r"(?:name|title|product)\s*[:\-]?\s*([A-Za-z0-9\s]{3,30})", text, re.IGNORECASE)) or len(text.splitlines()[0].strip()) > 3
    first_line = text.splitlines()[0].strip() if text.splitlines() else "Unknown"
    fields_eval.append(LabelFieldStatus(
        field_name="Product Name / Classical Title",
        is_detected=has_name,
        detected_value=first_line if has_name else None,
        statutory_rule="D&C Rule 161(1)(a)",
        status="COMPLIANT" if has_name else "MISSING_REQUIRED",
        guidance="Must state the approved classical name from First Schedule texts or trade/proprietary brand name."
    ))

    # 2. Composition / Ingredients with Botanical Names
    has_botanicals = bool(re.search(r"(?:composition|ingredients|each\s+(?:capsule|tablet|100g|10ml)\s+contains|contains)\s*[:\-]?", text, re.IGNORECASE)) or any(w in lower for w in ["withania", "bacopa", "emblica", "terminalia", "curcuma", "zingiber", "tinospora", "extract", "churna"])
    fields_eval.append(LabelFieldStatus(
        field_name="Active Ingredients & Botanical Names",
        is_detected=has_botanicals,
        detected_value="Botanical composition declared" if has_botanicals else None,
        statutory_rule="D&C Rule 161(1)(b)",
        status="COMPLIANT" if has_botanicals else "MISSING_REQUIRED",
        guidance="Mandatory true list of all ingredients with botanical names, parts used (e.g. Mula, Patra), and quantities."
    ))
    if not has_botanicals:
        missing_critical.append("Botanical ingredients list with plant parts used")

    # 3. Manufacturing License Number
    has_lic = bool(re.search(r"(?:mfg\.?\s*lic\.?\s*(?:no\.?|number)|lic\.?\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-]+)", text, re.IGNORECASE))
    lic_match = re.search(r"(?:mfg\.?\s*lic\.?\s*(?:no\.?|number)|lic\.?\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-]+)", text, re.IGNORECASE)
    fields_eval.append(LabelFieldStatus(
        field_name="Manufacturing Licence Number",
        is_detected=has_lic,
        detected_value=lic_match.group(0) if lic_match else None,
        statutory_rule="D&C Rule 161(1)(e)",
        status="COMPLIANT" if has_lic else "MISSING_REQUIRED",
        guidance="Must display valid State AYUSH Licensing Authority number on format 'Mfg. Lic. No. [State]/[Number]'."
    ))
    if not has_lic:
        missing_critical.append("Manufacturing License Number (Mfg. Lic. No.)")

    # 4. Batch Number / Lot Number
    has_batch = bool(re.search(r"(?:batch\s*(?:no\.?|number)|lot\s*(?:no\.?|number)|b\.?\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9\-]+)", text, re.IGNORECASE))
    batch_match = re.search(r"(?:batch\s*(?:no\.?|number)|lot\s*(?:no\.?|number)|b\.?\s*no\.?)\s*[:\-]?\s*([A-Za-z0-9\-]+)", text, re.IGNORECASE)
    fields_eval.append(LabelFieldStatus(
        field_name="Batch / Lot Identifier",
        is_detected=has_batch,
        detected_value=batch_match.group(0) if batch_match else None,
        statutory_rule="D&C Rule 161(1)(d)",
        status="COMPLIANT" if has_batch else "MISSING_REQUIRED",
        guidance="Mandatory for batch traceability to master production and quality control records."
    ))
    if not has_batch:
        missing_critical.append("Batch / Lot Number")

    # 5. Net Quantity / Weight
    has_qty = bool(re.search(r"(?:net\s*(?:qty\.?|quantity|content|wt\.?|weight)|volume)\s*[:\-]?\s*(\d+\s*(?:g|gm|kg|ml|l|capsules|tablets))", text, re.IGNORECASE)) or any(w in lower for w in ["60 capsules", "100 tablets", "100 ml", "50 g", "100g", "200ml", "500mg"])
    fields_eval.append(LabelFieldStatus(
        field_name="Net Quantity / Pack Size",
        is_detected=has_qty,
        detected_value="Net content specified" if has_qty else None,
        statutory_rule="D&C Rule 161(1)(c) & Legal Metrology Act",
        status="COMPLIANT" if has_qty else "MISSING_REQUIRED",
        guidance="Must state numerical net weight, volume, or unit count."
    ))

    # 6. Manufacturer Name & Address
    has_mfg_addr = bool(re.search(r"(?:mfd\s*by|manufactured\s*by|mfg\s*by|marketed\s*by)\s*[:\-]?\s*([A-Za-z0-9\s,\.\-]{10,80})", text, re.IGNORECASE)) or any(w in lower for w in ["pvt ltd", "pharmaceuticals", "laboratories", "ayurveda", "works", "industrial area"])
    fields_eval.append(LabelFieldStatus(
        field_name="GMP Manufacturer Name & Address",
        is_detected=has_mfg_addr,
        detected_value="Manufacturer identification present" if has_mfg_addr else None,
        statutory_rule="D&C Rule 161(1)(f)",
        status="COMPLIANT" if has_mfg_addr else "MISSING_REQUIRED",
        guidance="Full commercial name and physical factory premises address of the licensed Schedule T GMP manufacturer."
    ))

    # 7. Dates (Mfg Date & Expiry)
    has_date = bool(re.search(r"(?:mfg\.?\s*date|exp\.?\s*date|use\s*before|best\s*before)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\w+\s*\d{4})", text, re.IGNORECASE)) or any(w in lower for w in ["mfg:", "exp:", "expiry", "best before"])
    fields_eval.append(LabelFieldStatus(
        field_name="Dates: Manufacturing & Expiry",
        is_detected=has_date,
        detected_value="Date markings present" if has_date else None,
        statutory_rule="D&C Rule 161(1)(h)",
        status="COMPLIANT" if has_date else "MISSING_REQUIRED",
        guidance="Mandatory Date of Manufacture and Expiry Date (maximum shelf life per Gazette notification)."
    ))

    # 8. Schedule E(1) Poisonous Herbs Caution Check
    detected_e1 = [h for h in SCHEDULE_E1_HERBS if re.search(rf"\b{re.escape(h)}\b", lower)]
    has_e1_warning = bool(re.search(r"medical\s*supervision|caution|physician", lower))

    if detected_e1:
        fields_eval.append(LabelFieldStatus(
            field_name="Schedule E(1) Medical Supervision Warning",
            is_detected=has_e1_warning,
            detected_value="Caution warning present" if has_e1_warning else "WARNING ABSENT",
            statutory_rule="D&C Rule 161(1)(g) & Schedule E(1)",
            status="COMPLIANT" if has_e1_warning else "MISSING_REQUIRED",
            guidance=f"Detected Schedule E(1) poisonous botanical(s): {', '.join(detected_e1)}. Label MUST prominently display: 'Caution: To be taken under medical supervision'."
        ))
        if not has_e1_warning:
            missing_critical.append("Mandatory Schedule E(1) Warning: 'Caution: To be taken under medical supervision'")

    # 9. Food / Ayurveda Aahar specific declarations
    if is_food:
        has_aahar_logo = "ayurveda aahar" in lower or "fssai" in lower
        fields_eval.append(LabelFieldStatus(
            field_name="Ayurveda Aahar Official Logo & Declarations",
            is_detected=has_aahar_logo,
            detected_value="Ayurveda Aahar / FSSAI statement detected" if has_aahar_logo else None,
            statutory_rule="FSS (Ayurveda Aahar) Regulations, 2022 Regulation 8",
            status="COMPLIANT" if has_aahar_logo else "MISSING_REQUIRED",
            guidance="Mandatory display of the official Ayurveda Aahar logo and statement 'Not for medicinal use'."
        ))

    compliant_count = sum(1 for f in fields_eval if f.status == "COMPLIANT")
    total_evaluated = len(fields_eval)
    score = int((compliant_count / total_evaluated) * 100) if total_evaluated > 0 else 0

    return LabelReviewResponse(
        product_category=payload.product_category,
        compliance_score_percent=score,
        fields_evaluated=fields_eval,
        schedule_e1_warning_required=len(detected_e1) > 0,
        schedule_e1_detected_herbs=detected_e1,
        critical_missing=missing_critical,
        statutory_citations=[
            {
                "id": "DC_RULES_161_LABELLING",
                "act_title": "Drugs and Cosmetics Rules, 1945",
                "section": "Rule 161",
                "authority": "Ministry of Ayush / State Licensing Authorities",
                "url": "https://ayush.gov.in/docs/drugs-and-cosmetics-act-1940.pdf"
            }
        ],
        recommendations=[
            "Ensure indelible printing on container and outer carton.",
            "Verify all botanical ingredients include genus, species, and plant part (e.g. Withania somnifera Root).",
            "Confirm font size meets Legal Metrology (Packaged Commodities) Rules 2011.",
        ],
        disclaimer="Label compliance analysis is an algorithmic decision-support tool. It does not replace final carton artwork proof sign-off by an accredited regulatory officer."
    )
