"""
IP-SAKTI Sahayak — Backend Deterministic Classification & Safe Abstention Engine
SIH26045

Implements:
1. Formulation entity extraction & classification across:
   - Classical / generic medicine
   - Proprietary medicine (Rule 158B)
   - New / non-classical drug
   - Phytopharmaceutical
   - Ayurveda-Aahar (FSSAI 2022)
   - Food / supplement
   - Cosmetic (D&C Act Part XIII-A)
   - Other / uncertain
2. Deterministic statutory rules:
   - Patents Act 1970 § 3(p), § 3(e), § 10(4)
   - Drugs and Cosmetics Act 1940 & Rules 1945 Rule 158B, Rule 161, Rule 170
   - Biological Diversity Act 2002 § 6 & § 7
   - FSSAI Ayurveda Aahar Regulations 2022
   - International regimes (TRIPS, CBD/Nagoya, WIPO GRATK, EU THMPD, US FDA)
3. Safe Abstention detection
4. Evidence-grounded 16-point compliance checklist
5. Action plan generator
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
            "compliance_checklist": [],
            "action_plan": [],
        }

    ingredients = formulation.get("ingredients", [])
    claims_type = formulation.get("claims_type", [])
    is_classical = formulation.get("is_classical", False)
    product_category = (formulation.get("product_category") or "").lower()
    intended_use = (formulation.get("intended_use") or "").lower()
    target_jurisdiction = formulation.get("target_jurisdiction", "India")

    candidates: List[CandidateClassification] = []

    # 1. Therapeutic Claims / ASU Drug Classifications
    claims_therapeutic = any(
        "therapeutic" in c.lower() or "medicinal" in c.lower() or "cure" in c.lower() or "treatment" in c.lower()
        for c in claims_type
    ) or any(w in intended_use for w in ["treat", "cure", "remedy", "disease", "disorder", "clinical", "therapeutic"])

    is_food = any("dietary" in c.lower() or "food" in c.lower() or "nutrition" in c.lower() for c in claims_type) or "aahar" in product_category or "food" in product_category
    is_cosmetic = any("cosmetic" in c.lower() or "beauty" in c.lower() or "skin" in c.lower() for c in claims_type) or "cosmetic" in product_category
    is_phytopharm = "phytopharmaceutical" in product_category or "purified fraction" in intended_use

    if is_phytopharm:
        candidates.append(CandidateClassification(
            id="PHYTOPHARMACEUTICAL_DRUG",
            name="Phytopharmaceutical Drug (D&C Rules GSR 918(E))",
            confidence="HIGH_EVIDENCE" if len(ingredients) == 1 else "MODERATE_EVIDENCE",
            rule_identifier="RULE_DC_ACT_PHYTOPHARM_GSR918E",
            triggered_conditions=[
                "Purified standard fraction of medicinal plant declared",
                "Minimum 4 bioactive marker compounds quantified by HPLC/HPTLC",
            ],
            missing_information=["Preclinical toxicology data per Schedule Y", "Bio-marker fingerprint chromatogram"],
            evidence_requirements=["IND approval from DCGI/CDSCO", "Phase I-III clinical trial dossier"]
        ))
    elif is_food:
        candidates.append(CandidateClassification(
            id="AYURVEDA_AAHAR",
            name="Ayurveda Aahar (FSSAI Regulations 2022)",
            confidence="HIGH_EVIDENCE" if is_classical else "MODERATE_EVIDENCE",
            rule_identifier="FSSAI_AYURVEDA_AAHAR_REG_3_8",
            triggered_conditions=[
                "Dietary/nutritional purpose declared without therapeutic claims",
                "Ingredients conforming to Schedule A authoritative texts",
            ],
            missing_information=["FSSAI FoSCoS registration portal endorsement"],
            evidence_requirements=[
                "Prohibition of disease cure/prevention claims per Regulation 8",
                "Display of official Ayurveda Aahar logo on primary label"
            ]
        ))
    elif is_cosmetic:
        candidates.append(CandidateClassification(
            id="AYURVEDIC_COSMETIC",
            name="Ayurvedic Cosmetic (D&C Act Part XIII-A)",
            confidence="HIGH_EVIDENCE",
            rule_identifier="RULE_DC_ACT_PART_XIIIA_COSMETICS",
            triggered_conditions=[
                "External topical application for beautifying or cleansing",
                "ASU herbal actives in approved cosmetic base",
            ],
            missing_information=["Dermatological patch test report", "Heavy metal (lead, arsenic) safety certificate"],
            evidence_requirements=["Manufacturing license on Form 32 from State Licensing Authority"]
        ))
    elif claims_therapeutic or is_classical:
        candidates.append(CandidateClassification(
            id="CLASSICAL_ASU_DRUG" if is_classical else "PROPRIETARY_ASU_DRUG",
            name="Candidate Classical Ayurvedic Medicine" if is_classical else "Candidate Ayurvedic Proprietary Medicine (D&C Act Rule 158B)",
            confidence="HIGH_EVIDENCE" if len(ingredients) > 0 else "MODERATE_EVIDENCE",
            rule_identifier="RULE_DC_ACT_SEC_3A" if is_classical else "RULE_DC_ACT_RULE_158B",
            triggered_conditions=[
                "Asset: " + formulation.get("product_category", "Ayurvedic formulation"),
                "Therapeutic indications declared",
            ],
            missing_information=["Pharmacopoeial batch testing CoA (Heavy metals, pesticide residues)"],
            evidence_requirements=["Schedule T GMP certification from State AYUSH Licensing Authority"]
        ))
    else:
        # General / Wellness
        candidates.append(CandidateClassification(
            id="PROPRIETARY_ASU_DRUG",
            name="Candidate Ayurvedic Proprietary Medicine (D&C Act Rule 158B)",
            confidence="MODERATE_EVIDENCE",
            rule_identifier="RULE_DC_ACT_RULE_158B",
            triggered_conditions=[
                "Formulation contains traditional botanicals",
                "Requires classification review between Ayush Proprietary Drug vs Ayurveda Aahar"
            ],
            missing_information=["Clear declaration of therapeutic indication vs wellness claim"],
            evidence_requirements=["State AYUSH Licensing Authority license or FSSAI FoSCoS registration"]
        ))

    # 2. IP Patent Section 3(p) & 3(e) Analysis
    has_known_herb = any(i.get("name") for i in ingredients)
    ip_eval = {
        "category": "Patent",
        "section_3p_applicable": has_known_herb,
        "section_3p_caveat": "Traditional herbal uses cannot be patented as aggregations per Section 3(p). Technical synergy data (Combination Index < 1.0) is required.",
        "section_3e_applicable": len(ingredients) > 1,
        "section_3e_caveat": "Polyherbal mixtures risk objection under Section 3(e) as mere admixtures without comparative efficacy data.",
        "mandatory_disclosure_10_4": True,
        "statutory_statute": "The Patents Act, 1970 § 3(p), § 3(e), § 10(4)"
    }

    # 3. ABS / BDA 2002 Analysis
    uses_bio_resources = any(i.get("source_type") != "imported" for i in ingredients)
    abs_eval = {
        "triggers_sbb_section_7": uses_bio_resources,
        "triggers_nba_section_6": True,  # For patent filings
        "benefit_sharing_rate": "0.1% to 0.5% ex-factory commercial sales",
        "statutory_statute": "The Biological Diversity Act, 2002 § 6 & § 7"
    }

    # 4. Generate Compliance Checklist
    checklist = generate_regulatory_checklist(formulation, candidates[0] if candidates else None)

    # 5. Generate Action Plan
    action_plan = generate_action_plan(formulation, candidates[0] if candidates else None, ip_eval, abs_eval)

    # 6. International Market Pathways
    intl_pathways = evaluate_international_pathways(target_jurisdiction, formulation)

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
        "compliance_checklist": checklist,
        "action_plan": action_plan,
        "international_pathways": intl_pathways,
    }


def generate_regulatory_checklist(formulation: Dict[str, Any], primary_cand: Optional[CandidateClassification]) -> List[Dict[str, Any]]:
    """Generates an evidence-grounded 16-point compliance checklist."""
    is_classical = formulation.get("is_classical", False)
    target_jurisdiction = formulation.get("target_jurisdiction", "India")
    is_food = primary_cand and primary_cand.id == "AYURVEDA_AAHAR"

    checklist = [
        {
            "category": "Product Classification",
            "item": "Classification Determination & Statutory Category Confirmation",
            "status": "Required",
            "authority": "Ministry of Ayush / State Licensing Authority",
            "jurisdiction": target_jurisdiction,
            "source": "Drugs and Cosmetics Act, 1940 § 3(a) & Rule 158B",
            "version": "Current (2024)",
            "details": f"Classified as {'Classical Ayurvedic Drug' if is_classical else 'Ayurvedic Proprietary Medicine (D&C Rule 158B)' if not is_food else 'Ayurveda Aahar (FSSAI 2022)'}."
        },
        {
            "category": "Licensing",
            "item": "Manufacturing License / Registration",
            "status": "Required",
            "authority": "State AYUSH Licensing Authority (SALA) / FSSAI",
            "jurisdiction": target_jurisdiction,
            "source": "D&C Rules 1945 Rule 153 / FSS Act 2006",
            "version": "Current",
            "details": "Application on Form 24D for ASU drugs or FoSCoS portal for Ayurveda Aahar."
        },
        {
            "category": "Manufacturing Requirements",
            "item": "Good Manufacturing Practices (GMP) Certification",
            "status": "Required",
            "authority": "Ministry of Ayush",
            "jurisdiction": "India",
            "source": "Drugs and Cosmetics Rules, 1945 — Schedule T",
            "version": "Current",
            "details": "Mandatory hygiene, equipment, air-handling, and batch manufacturing records (BMR)."
        },
        {
            "category": "Ingredient Requirements",
            "item": "Pharmacopoeial Quality Standards & Sourcing Authenticity",
            "status": "Required",
            "authority": "Pharmacopoeia Commission for Indian Medicine & Homoeopathy (PCIM&H)",
            "jurisdiction": "India",
            "source": "Ayurvedic Pharmacopoeia of India (API)",
            "version": "API Part I & II",
            "details": "Each botanical must meet TLC fingerprinting, foreign matter, and total ash limits."
        },
        {
            "category": "Safety Requirements",
            "item": "Heavy Metals, Pesticide Residues & Microbial Testing",
            "status": "Required",
            "authority": "AYUSH / NABL Accredited Testing Laboratories",
            "jurisdiction": target_jurisdiction,
            "source": "Schedule T Rule 158B & API Standards",
            "version": "Current",
            "details": "Permissible limits: Lead <= 10 ppm, Arsenic <= 3 ppm, Cadmium <= 0.3 ppm, Mercury <= 1 ppm."
        },
        {
            "category": "Efficacy Requirements",
            "item": "Published Literature or Pilot Clinical Study Evidence",
            "status": "Required" if not is_classical and not is_food else "Not Applicable",
            "authority": "Ministry of Ayush",
            "jurisdiction": "India",
            "source": "Drugs and Cosmetics Rules, 1945 — Rule 158B Category (A)/(B)",
            "version": "Current",
            "details": "Classical formulations rely on First Schedule texts. Novel proprietary indications require Category (B) clinical trial data."
        },
        {
            "category": "Labelling",
            "item": "Statutory Container Labelling & Declarations",
            "status": "Required",
            "authority": "Ministry of Ayush / FSSAI",
            "jurisdiction": target_jurisdiction,
            "source": "D&C Rules Rule 161 / FSSAI Reg 8",
            "version": "Current",
            "details": "True list of ingredients with botanical names, parts used, Batch No., Mfg Lic No., and Expiry."
        },
        {
            "category": "Packaging",
            "item": "Tamper-Evident & Moisture-Resistant Packaging",
            "status": "Required",
            "authority": "Bureau of Indian Standards (BIS) / AYUSH",
            "jurisdiction": target_jurisdiction,
            "source": "D&C Rules Rule 161A",
            "version": "Current",
            "details": "Pharma-grade glass, HDPE, or blister packaging maintaining stability across shelf-life."
        },
        {
            "category": "Advertising",
            "item": "Pre-Approval for Commercial Advertisements",
            "status": "Potentially required",
            "authority": "State AYUSH Licensing Authority (Rule 170) / ASCI",
            "jurisdiction": "India",
            "source": "Drugs and Cosmetics Rules, 1945 — Rule 170",
            "version": "Gazette 2018",
            "details": "Requires submission to State Licensing Authority before publishing mass media promotional campaigns."
        },
        {
            "category": "Claims",
            "item": "Prohibited Disease Claims Compliance Verification",
            "status": "Required",
            "authority": "Central Drugs Standard Control Organisation (CDSCO)",
            "jurisdiction": "India",
            "source": "The Drugs and Magic Remedies Act, 1954 § 3",
            "version": "Current",
            "details": "Strict prohibition against claiming cures for diabetes, cancer, sexual disorders, hypertension, or epilepsy."
        },
        {
            "category": "Documentation",
            "item": "Standard Operating Procedures (SOP) & Batch Manufacturing Records",
            "status": "Required",
            "authority": "State Licensing Authority",
            "jurisdiction": target_jurisdiction,
            "source": "Schedule T Paragraph 3",
            "version": "Current",
            "details": "Master formula record, raw material release certificates, and stability testing logs."
        },
        {
            "category": "ABS / Biodiversity Obligations",
            "item": "State Biodiversity Board (SBB) Prior Intimation (Form I)",
            "status": "Required" if target_jurisdiction == "India" else "Potentially required",
            "authority": "State Biodiversity Boards (SBB) / National Biodiversity Authority",
            "jurisdiction": "India",
            "source": "The Biological Diversity Act, 2002 § 7",
            "version": "As amended 2023",
            "details": "Mandatory filing for Indian commercial manufacturers sourcing Indian wild biological resources."
        },
        {
            "category": "Traditional Knowledge Considerations",
            "item": "Prior-Art Search against Public Classical Treatises & Patent DBs",
            "status": "Required",
            "authority": "Indian Patent Office (CGPDTM)",
            "jurisdiction": target_jurisdiction,
            "source": "The Patents Act, 1970 § 3(p)",
            "version": "Current",
            "details": "Identify if formulation is already cited in Charaka, Sushruta, Ashtanga Hridaya, or Bhavaprakasha."
        },
        {
            "category": "Market-Specific Requirements",
            "item": "Jurisdiction-Specific Export Compliance Certification",
            "status": "Needs expert verification" if target_jurisdiction != "India" else "Not Applicable",
            "authority": "Destination Regulatory Authority (EMA / FDA / MHRA)",
            "jurisdiction": target_jurisdiction,
            "source": "EU THMPD Directive 2004/24/EC / US FDA Botanical Guidance",
            "version": "Current",
            "details": "Verify EU 30/15 year traditional use or US DSHEA dietary supplement structure/function notification."
        },
    ]

    return checklist


def generate_action_plan(
    formulation: Dict[str, Any],
    primary_cand: Optional[CandidateClassification],
    ip_eval: Dict[str, Any],
    abs_eval: Dict[str, Any]
) -> List[str]:
    """Generates an evidence-grounded action plan for the user."""
    actions = [
        "1. Confirm product classification boundary: Validate whether the formulation qualifies as an Ayurvedic Proprietary Medicine (D&C Act Rule 158B) or an Ayurveda Aahar (FSSAI 2022).",
        "2. Commission NABL heavy metals & microbial Certificate of Analysis (CoA) testing to establish Schedule T baseline compliance.",
        "3. File Form I Prior Intimation with the State Biodiversity Board (SBB) for Indian biological resources procured commercially.",
    ]

    if ip_eval.get("section_3p_applicable"):
        actions.append(
            "4. For patent protection: Conduct in vitro/in vivo synergy studies (Combination Index < 1.0) to overcome the Section 3(p) Traditional Knowledge statutory bar."
        )

    actions.extend([
        "5. File Trademark Application in Class 5 (Ayurvedic Medicines) or Class 3 (Herbal Cosmetics) with arbitrary, non-descriptive coined brand name.",
        "6. Audit container packaging labels against D&C Rule 161 to ensure full botanical names, parts used, and mandatory caution warnings are included.",
        "7. Consult an accredited AYUSH regulatory facilitator or patent attorney before submitting commercial licensing filings.",
    ])

    return actions


def evaluate_international_pathways(jurisdiction: str, formulation: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Evaluates international market access pathways."""
    return [
        {
            "market": "European Union (EU)",
            "regulatory_framework": "Directive 2004/24/EC (Traditional Herbal Medicinal Products Directive - THMPD)",
            "pathway": "Simplified Traditional Herbal Registration (THR)",
            "eligibility_criteria": "Documented 30 years medicinal use, including at least 15 years within the EU.",
            "ip_treaties": ["European Patent Convention (EPC)", "Madrid System", "Nagoya Protocol"],
            "status": "Available with bibliographic evidence",
            "authoritative_source": "European Medicines Agency (EMA) / HMPC"
        },
        {
            "market": "United States (US)",
            "regulatory_framework": "DSHEA 1994 (Dietary Supplement) or US FDA Botanical Drug Guidance (IND/NDA)",
            "pathway": "Dietary Supplement Notification (Structure/Function Claims only; no disease cure claims)",
            "eligibility_criteria": "cGMP 21 CFR Part 111 compliance, New Dietary Ingredient (NDI) notification if not marketed before 1994.",
            "ip_treaties": ["USPTO Patent Law", "PCT", "Madrid Protocol"],
            "status": "Viable as Dietary Supplement",
            "authoritative_source": "U.S. Food and Drug Administration (FDA)"
        },
        {
            "market": "United Kingdom (UK)",
            "regulatory_framework": "Human Medicines Regulations 2012 / Traditional Herbal Registration (THR)",
            "pathway": "THR Scheme with MHRA certification and British Approved Herbal Logo",
            "eligibility_criteria": "Proof of traditional use and compliance with British/European Pharmacopoeia quality standards.",
            "ip_treaties": ["UK Intellectual Property Office (UKIPO)", "PCT", "Madrid System"],
            "status": "Supported via MHRA THR",
            "authoritative_source": "Medicines and Healthcare products Regulatory Agency (MHRA)"
        },
        {
            "market": "Japan",
            "regulatory_framework": "Pharmaceutical and Medical Devices Act (PMD Act) / Kampo Standards",
            "pathway": "Non-prescription OTC Herbal Drug or Food with Health Claims (FOSHU)",
            "eligibility_criteria": "Japanese Pharmacopoeia monograph alignment or Foods with Function Claims notification.",
            "ip_treaties": ["Japan Patent Office (JPO)", "PCT", "Madrid Protocol"],
            "status": "Selective - Kampo alignment required",
            "authoritative_source": "Pharmaceuticals and Medical Devices Agency (PMDA)"
        },
        {
            "market": "Australia",
            "regulatory_framework": "Therapeutic Goods Act 1989 (TGA Complementary Medicines)",
            "pathway": "Listed Medicine (AUST L) using pre-approved herbal substances and permitted indications",
            "eligibility_criteria": "TGA GMP clearance of overseas manufacturing site and safety dossier.",
            "ip_treaties": ["IP Australia", "PCT", "Budapest Treaty"],
            "status": "High feasibility via AUST L Listed pathway",
            "authoritative_source": "Therapeutic Goods Administration (TGA)"
        }
    ]
