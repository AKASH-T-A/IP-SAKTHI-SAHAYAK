import httpx

claims = [
    # 1. Prohibited claim (Diabetes cure)
    "Guaranteed 100% cure for diabetes and permanent blood sugar elimination within 14 days.",
    # 2. Unsupported / high risk claim (Cancer & cardiac disorder)
    "Clinically proven miracle cure for malignant tumours and cardiac disease.",
    # 3. Permissible wellness claim
    "Traditionally prepared to promote digestive wellness, vitality, and general daily rejuvenation."
]

with httpx.Client(base_url="http://localhost:8000") as client:
    for idx, claim in enumerate(claims, 1):
        res = client.post("/api/v1/claims/check", json={
            "claim_text": claim,
            "product_category": "Ayurvedic Proprietary Medicine"
        })
        assert res.status_code == 200, f"Failed on claim {idx}: {res.text}"
        data = res.json()
        print(f"\n--- Claim Test {idx} ---")
        print(f"Text:        {claim[:60]}...")
        print(f"Status:      {data['overall_status']}")
        print(f"Risk Score:  {data['risk_score']}")
        print(f"Findings:    {len(data['detected_findings'])} statutory flags detected")
        for f in data['detected_findings']:
            print(f"  * [{f['risk_level']}] {f['cited_act_rule']} ({f['section_number']}): {f['issue_type']}")
