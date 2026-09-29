import httpx

payload = {
    "case_title": "Medhya Rasayana Synergistic Nootropic",
    "formulation": {
        "product_category": "Ayurvedic Proprietary Medicine",
        "ingredients": [
            {"name": "Ashwagandha", "source_type": "cultivated"},
            {"name": "Brahmi", "source_type": "cultivated"}
        ],
        "intended_use": "Memory support and mental focus",
        "target_jurisdiction": "India"
    },
    "user_questions": [
        "Does the synergistic data overcome Section 3(p) Traditional Knowledge bar?",
        "What are our benefit-sharing liabilities with the State Biodiversity Board?"
    ]
}

with httpx.Client(base_url="http://localhost:8000") as client:
    res = client.post("/api/v1/expert/consultation-package", json=payload)
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    print("Package ID:       ", data["package_id"])
    print("Submission Status:", data["submission_status"])
    print("Disclaimer:       ", data["disclaimer"])
    print("Questions:        ", len(data["questions_for_expert"]))
    print("Evidence Gaps:    ", len(data["identified_evidence_gaps"]))
    print("Citations:        ", len(data["statutory_citations"]))
    assert "not yet submitted to an external expert" in data["disclaimer"].lower() or "not submitted externally" in data["disclaimer"].lower()
    print("VERIFIED: Disclaimer explicitly warns package is prepared for expert review and NOT submitted externally.")
