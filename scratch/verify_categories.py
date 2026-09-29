import sys
sys.path.insert(0, "backend")
from app.classification.engine import evaluate_deterministic_classification

categories = [
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

for cat, is_class, exp_id in categories:
    res = evaluate_deterministic_classification({
        "product_category": cat,
        "ingredients": [{"name": "Sample Botanical", "source_type": "cultivated"}],
        "intended_use": "Daily health support",
        "is_classical": is_class,
        "target_jurisdiction": "India"
    })
    cand = res["candidate_classifications"][0]
    print(f"VERIFIED: {cat:25} -> {cand['id']:26} [{cand['rule_identifier']}]")
