import sys
sys.path.insert(0, "backend")
from app.classification.engine import evaluate_deterministic_classification

res = evaluate_deterministic_classification({
    "product_category": "Ayurvedic formulation",
    "ingredients": [
        {"name": "Ashwagandha", "origin_state": "Madhya Pradesh", "source_type": "cultivated"}
    ],
    "intended_use": "Cognitive vitality and stress relief",
    "target_jurisdiction": "India"
})

pathways = res.get("ip_pathways", [])
print(f"Total IP Pathways: {len(pathways)}")
for idx, p in enumerate(pathways, 1):
    print(f"\n[{idx}] {p['ip_type']} ({p['classification']})")
    print(f"    Authority:    {p['applicable_authority']}")
    print(f"    Jurisdiction: {p['jurisdiction']}")
    print(f"    Evidence:     {p['evidence'][:80]}...")
    print(f"    Requirements: {len(p['requirements'])} requirements defined")
    print(f"    Action:       {p['action'][:80]}...")
