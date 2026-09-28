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


def test_classification_all_10_statutory_categories():
    """Verify deterministic evidence-backed classification across all 10 required statutory categories."""
    categories_to_test = [
        ("Classical formulation", True, "CLASSICAL_ASU_DRUG"),
        ("Ayurvedic formulation", False, "PROPRIETARY_ASU_DRUG"),
        ("New drug", False, "NEW_DRUG"),
        ("Phytopharmaceutical drug", False, "PHYTOPHARMACEUTICAL_DRUG"),
        ("Ayurveda Aahar", False, "AYURVEDA_AAHAR"),
        ("Ayurvedic Cosmetic", False, "AYURVEDIC_COSMETIC"),
        ("Conventional drug", False, "CONVENTIONAL_DRUG"),
        ("Food supplement", False, "GENERAL_FOOD"),
        ("Herbal product", False, "HERBAL_PRODUCT"),
        ("Unknown formulation", False, "UNKNOWN_OTHER"),
    ]

    for cat_name, is_class, expected_id in categories_to_test:
        f = {
            "product_category": cat_name,
            "ingredients": [{"name": "Sample Botanical", "source_type": "cultivated"}],
            "intended_use": "Daily therapeutic or nutritional support",
            "is_classical": is_class,
            "target_jurisdiction": "India",
        }
        res = evaluate_deterministic_classification(f)
        assert res["status"] == "EVALUATED", f"Failed on category {cat_name}"
        assert len(res["candidate_classifications"]) > 0
        cand_id = res["candidate_classifications"][0]["id"]
        assert cand_id == expected_id, f"Category '{cat_name}' yielded '{cand_id}', expected '{expected_id}'"


def test_comprehensive_9_area_ip_coverage():
    """Verify that IP coverage connects Classification -> Evidence -> Authority -> Jurisdiction -> Requirements -> Action across all 9 IP domains."""
    f = {
        "product_category": "Ayurvedic formulation",
        "ingredients": [
            {"name": "Ashwagandha", "origin_state": "Madhya Pradesh", "source_type": "cultivated"}
        ],
        "intended_use": "Stress adaptation",
        "target_jurisdiction": "India",
    }
    res = evaluate_deterministic_classification(f)
    assert "ip_pathways" in res
    pathways = res["ip_pathways"]
    assert len(pathways) == 9

    expected_ip_types = {
        "Patent",
        "Geographical Indication",
        "Trademark",
        "Copyright",
        "Industrial Design",
        "Plant Variety Protection",
        "Biological Diversity / ABS",
        "Traditional Knowledge",
        "Prior-Art Intelligence"
    }
    actual_ip_types = {p["ip_type"] for p in pathways}
    assert expected_ip_types == actual_ip_types

    for p in pathways:
        assert p["classification"], f"Missing classification in {p['ip_type']}"
        assert p["applicable_authority"], f"Missing authority in {p['ip_type']}"
        assert p["jurisdiction"], f"Missing jurisdiction in {p['ip_type']}"
        assert p["evidence"], f"Missing evidence in {p['ip_type']}"
        assert len(p["requirements"]) > 0, f"Missing requirements in {p['ip_type']}"
        assert p["action"], f"Missing action in {p['ip_type']}"

