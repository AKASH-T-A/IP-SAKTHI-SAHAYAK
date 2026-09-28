"""
Unit Tests for IP-SAKTI Deterministic Classification & Safe Abstention Engine
"""
import pytest
from app.classification.engine import (
    evaluate_safe_abstention,
    evaluate_deterministic_classification,
)


def test_safe_abstention_on_empty_formulation():
    empty_formulation = {
        "ingredients": [],
        "intended_use": "",
        "target_jurisdiction": "",
    }
    result = evaluate_safe_abstention(empty_formulation)
    assert result.is_abstained is True
    assert "Active Botanical / Herbo-Mineral Ingredients" in result.missing_fields
    assert "Intended Indication or Functional Claim" in result.missing_fields
    assert "Target Regulatory Jurisdiction" in result.missing_fields


def test_classification_on_valid_ayurvedic_formulation():
    formulation = {
        "product_category": "Ayurvedic formulation",
        "ingredients": [
            {"name": "Ashwagandha", "source_type": "cultivated"},
            {"name": "Brahmi", "source_type": "cultivated"},
        ],
        "intended_use": "Cognitive vitality and stress adaptogen",
        "claims_type": ["Therapeutic / Medicinal (AYUSH)"],
        "is_classical": False,
        "target_jurisdiction": "India",
    }
    result = evaluate_deterministic_classification(formulation)
    assert result["status"] == "EVALUATED"
    assert result["safe_abstention"]["is_abstained"] is False
    assert len(result["candidate_classifications"]) > 0
    assert result["candidate_classifications"][0]["id"] == "PROPRIETARY_ASU_DRUG"
    assert result["ip_evaluation"]["section_3p_applicable"] is True
    assert result["abs_evaluation"]["triggers_sbb_section_7"] is True


def test_classification_withholds_when_abstained():
    incomplete = {
        "product_category": "Herbal product",
        "ingredients": [],  # Missing
        "intended_use": "Wellness",
        "target_jurisdiction": "India",
    }
    result = evaluate_deterministic_classification(incomplete)
    assert result["status"] == "ABSTAINED"
    assert result["safe_abstention"]["is_abstained"] is True
    assert len(result["candidate_classifications"]) == 0
