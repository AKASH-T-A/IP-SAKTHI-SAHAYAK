import httpx

sample_label = """
Medhya Rasayana Capsules
Contains: Withania somnifera Root 250mg, Bacopa monnieri 250mg, Vatsanabha 50mg.
Mfg Lic No: AY-5678/MH
Net Qty: 60 Capsules
Manufactured by: Sakti Ayush Labs, Plot 45, Pune, Maharashtra.
"""

with httpx.Client(base_url="http://localhost:8000") as client:
    res = client.post("/api/v1/label/review", json={
        "label_text": sample_label,
        "product_category": "Ayurvedic Proprietary Medicine"
    })
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    print("Compliance Score:", data["compliance_score_percent"], "%")
    print("Schedule E(1) Warning Required:", data["schedule_e1_warning_required"])
    print("Detected Schedule E(1) Herbs:", data["schedule_e1_detected_herbs"])
    print("Critical Missing Items:", data["critical_missing"])
    print("\nEvaluated Fields:")
    for f in data["fields_evaluated"]:
        print(f"  * {f['field_name']:42} | Status: {f['status']:18} | Rule: {f['statutory_rule']}")
