"""
IP-SAKTI Backend — Regulatory Compliance & Classification Endpoints
SIH26045
"""
from fastapi import APIRouter, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.classification.engine import (
    evaluate_deterministic_classification,
    evaluate_safe_abstention,
    generate_regulatory_checklist,
    evaluate_international_pathways,
)

router = APIRouter()


class IngredientSchema(BaseModel):
    id: Optional[str] = None
    name: str
    botanical_name: Optional[str] = None
    sanskrit_name: Optional[str] = None
    part_used: Optional[str] = None
    percentage: Optional[float] = None
    source_type: str = "cultivated"
    origin_state: Optional[str] = None


class FormulationInputSchema(BaseModel):
    product_category: str = Field(default="Ayurvedic formulation")
    dosage_form: Optional[str] = None
    ingredients: List[IngredientSchema] = Field(default_factory=list)
    preparation_method: Optional[str] = None
    classical_basis: Optional[str] = None
    is_classical: bool = False
    intended_use: str = ""
    claims_type: List[str] = Field(default_factory=list)
    commercial_intent: Optional[str] = None
    target_jurisdiction: str = "India"


@router.post("/evaluate")
async def evaluate_regulatory_pathway(payload: FormulationInputSchema = Body(...)):
    """
    Evaluates regulatory classification, IP considerations, ABS obligations,
    and safe abstention for a given formulation.
    """
    formulation_dict = payload.model_dump()
    result = evaluate_deterministic_classification(formulation_dict)
    return result


@router.post("/checklist")
async def get_compliance_checklist(payload: FormulationInputSchema = Body(...)):
    """
    Returns an evidence-grounded 16-point compliance checklist
    covering licensing, manufacturing, labelling, safety, advertising, and ABS.
    """
    formulation_dict = payload.model_dump()
    abstention = evaluate_safe_abstention(formulation_dict)
    if abstention.is_abstained:
        return {
            "status": "ABSTAINED",
            "reason": abstention.reason,
            "missing_fields": abstention.missing_fields,
            "checklist": []
        }

    eval_result = evaluate_deterministic_classification(formulation_dict)
    return {
        "status": "SUCCESS",
        "jurisdiction": payload.target_jurisdiction,
        "checklist": eval_result.get("compliance_checklist", []),
        "action_plan": eval_result.get("action_plan", [])
    }


@router.get("/international-regimes")
async def get_international_regimes(market: Optional[str] = "All"):
    """
    Returns structured authoritative coverage of international regimes:
    TRIPS, CBD, Nagoya Protocol, WIPO GRATK Treaty 2024, PCT, Madrid, Hague, Budapest.
    """
    pathways = evaluate_international_pathways("International", {})
    if market and market != "All":
        pathways = [p for p in pathways if market.lower() in p["market"].lower()]
    return {
        "status": "SUCCESS",
        "supported_markets": ["India", "EU", "USA", "UK", "Japan", "Australia"],
        "pathways": pathways
    }
