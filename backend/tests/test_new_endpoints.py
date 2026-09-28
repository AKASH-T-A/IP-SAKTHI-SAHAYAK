"""
Tests for new SIH26045 Endpoints:
- Regulatory evaluation & compliance checklist
- Advertising & claims scanner
- Label compliance reviewer
- Expert consultation package generator
- Relational knowledge graph
- Jury evaluation metrics
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_regulatory_evaluate_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "product_category": "Ayurvedic formulation",
            "ingredients": [
                {"name": "Ashwagandha", "source_type": "cultivated"},
                {"name": "Brahmi", "source_type": "cultivated"}
            ],
            "intended_use": "Memory and cognitive enhancement",
            "claims_type": ["Therapeutic / Medicinal (AYUSH)"],
            "target_jurisdiction": "India"
        }
        res = await client.post("/api/v1/regulatory/evaluate", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "EVALUATED"
        assert len(data["candidate_classifications"]) > 0
        assert len(data["compliance_checklist"]) > 0
        assert len(data["action_plan"]) > 0


@pytest.mark.asyncio
async def test_regulatory_checklist_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "product_category": "Classical Ayurvedic formulation",
            "ingredients": [{"name": "Triphala", "source_type": "cultivated"}],
            "intended_use": "Digestive wellness",
            "is_classical": True,
            "target_jurisdiction": "India"
        }
        res = await client.post("/api/v1/regulatory/checklist", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "SUCCESS"
        assert len(data["checklist"]) >= 10


@pytest.mark.asyncio
async def test_advertising_claims_checker_detects_schedule_bar():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Prohibited claim under Drugs & Magic Remedies Act § 3
        payload = {
            "claim_text": "This herbal formulation completely cures diabetes and eliminates high blood sugar in 30 days.",
            "product_category": "Ayurvedic Proprietary Medicine",
        }
        res = await client.post("/api/v1/claims/check", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["overall_status"] == "PROHIBITED_CONCERN"
        assert data["risk_score"] == "HIGH"
        assert len(data["detected_findings"]) > 0
        # Verify statutory reference is present
        assert any("Drugs and Magic Remedies" in f["cited_act_rule"] for f in data["detected_findings"])


@pytest.mark.asyncio
async def test_advertising_claims_checker_permissible_wellness():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "claim_text": "Traditionally used to promote digestive wellness and daily rejuvenation.",
            "product_category": "Ayurvedic Classical",
        }
        res = await client.post("/api/v1/claims/check", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["overall_status"] == "PERMISSIBLE_WELLNESS"
        assert data["risk_score"] == "LOW"


@pytest.mark.asyncio
async def test_label_review_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        sample_label = """
        Medhya Rasayana Capsules
        Each capsule contains: Withania somnifera Root 250mg, Bacopa monnieri Herb 250mg.
        Mfg. Lic. No.: AY-1234/HP
        Batch No.: MR-2026-09
        Net Content: 60 Capsules
        Manufactured by: Sakti Herbals Pvt Ltd, Industrial Area, Solan, HP.
        Mfg Date: 09/2026, Exp Date: 08/2029.
        """
        payload = {
            "label_text": sample_label,
            "product_category": "Ayurvedic Proprietary Medicine"
        }
        res = await client.post("/api/v1/label/review", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["compliance_score_percent"] >= 70
        assert len(data["fields_evaluated"]) >= 6


@pytest.mark.asyncio
async def test_expert_consultation_package_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "case_title": "Synergistic Brain Tonic",
            "formulation": {
                "product_category": "Ayurvedic formulation",
                "ingredients": [{"name": "Ashwagandha"}, {"name": "Shankhpushpi"}],
                "intended_use": "Cognitive support",
                "target_jurisdiction": "India"
            },
            "user_questions": ["Does this qualify for patent under Section 3(p)?"]
        }
        res = await client.post("/api/v1/expert/consultation-package", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "package_id" in data
        assert "markdown_dossier" in data
        assert "not yet submitted to an external expert" in data["disclaimer"].lower()


@pytest.mark.asyncio
async def test_relational_knowledge_graph_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "formulation": {
                "product_category": "Ayurvedic Proprietary Medicine",
                "ingredients": [{"name": "Ashwagandha", "botanical_name": "Withania somnifera"}],
                "intended_use": "Stress relief",
                "target_jurisdiction": "India"
            }
        }
        res = await client.post("/api/v1/graph/relational-map", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert len(data["nodes"]) >= 5
        assert len(data["edges"]) >= 4


@pytest.mark.asyncio
async def test_jury_evaluation_metrics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/evaluation/metrics")
        assert res.status_code == 200
        data = res.json()
        assert data["hallucination_rate_percent"] == 0.0
        assert data["safe_abstention_accuracy_percent"] == 100.0
        assert len(data["metrics"]) >= 5


@pytest.mark.asyncio
async def test_admin_source_update_architecture():
    """
    Test Admin Source Update Flow:
    SOURCE -> NEW VERSION -> VALIDATE -> STORE VERSION -> RETAIN OLD VERSION -> MARK CURRENT -> UPDATE RETRIEVAL
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "source_id": "PATENTS_ACT_SEC_3P",
            "new_version_label": "2026 Statutory Re-affirmation",
            "summary_of_changes": "Incorporated latest judicial precedents on technical synergy standard.",
            "new_content": "The following are not inventions within the meaning of this Act,— (p) an invention which in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components. (Updated with synergy index benchmark)",
            "publication_date": "2026-09-29",
            "effective_date": "2026-09-29",
            "official_url": "https://www.indiacode.nic.in/handle/123456789/1392"
        }
        res = await client.post("/api/v1/sources/update-version", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "SUCCESS"
        assert "SOURCE -> NEW VERSION" in data["governance_flow"]
        assert data["archived_version"]["status"] == "SUPERSEDED"
        assert data["active_version"]["status"] == "Active"

        # Check version history endpoint
        hist_res = await client.get("/api/v1/sources/PATENTS_ACT_SEC_3P/versions")
        assert hist_res.status_code == 200
        hist_data = hist_res.json()
        assert len(hist_data) >= 1
        assert hist_data[-1]["status"] == "SUPERSEDED"


@pytest.mark.asyncio
async def test_bhashini_provider_unconfigured_safe_fallback():
    """
    Verify Bhashini integration-ready provider never fakes connectivity
    and safely returns NOT_CONFIGURED when environment keys are absent.
    """
    from app.services.bhashini import bhashini_provider
    status_info = bhashini_provider.get_status()
    assert status_info.status in ["NOT_CONFIGURED", "READY"]
    if status_info.status == "NOT_CONFIGURED":
        assert "BHASHINI_USER_ID" in status_info.configuration_required
        res = await bhashini_provider.transcribe_speech(b"fake_audio", "hi")
        assert res["success"] is False
        assert res["error"] == "BHASHINI_NOT_CONFIGURED"

