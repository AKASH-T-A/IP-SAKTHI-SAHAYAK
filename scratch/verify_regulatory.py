import sys
sys.path.insert(0, "backend")
from app.classification.engine import evaluate_deterministic_classification

res = evaluate_deterministic_classification({
    "product_category": "Ayurvedic formulation",
    "ingredients": [{"name": "Ashwagandha", "source_type": "cultivated"}],
    "intended_use": "Vitality",
    "is_classical": False,
    "target_jurisdiction": "India"
})

checklist = res.get("compliance_checklist", [])
print(f"Total Compliance Checklist items: {len(checklist)}")
categories = set()
statuses = set()
for item in checklist:
    categories.add(item["category"])
    statuses.add(item["status"])
    print(f"[{item['category']:25}] {item['item']:45} | Status: {item['status']}")

print("\nCategories covered:", len(categories))
print("Statuses observed:", statuses)
