"""
Unit & Integration Tests for All Indian Languages (Bharat Multilingual Engine):
- Script and Language Detection
- Cross-Lingual Intent Classification across 12+ Scripts
- Canonical Ayurveda Entity Extraction
- Cross-Lingual Hybrid Retrieval & Citation Integrity
- Localized Response Generation (Kannada, Tamil, Telugu, Hindi, Malayalam, Urdu, etc.)
- RTL Detection for Urdu, Kashmiri, Sindhi
"""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.rag.multilingual import (
    SCHEDULED_LANGUAGES, RTL_LANGUAGES,
    detect_language_script, classify_multilingual_intent,
    extract_ayurvedic_entities, normalize_query_for_retrieval,
    build_localized_response
)
from app.rag.rag_pipeline import RAGPipeline


def test_scheduled_languages_completeness():
    """Confirms all 22 Eighth Schedule languages + English are registered."""
    assert len(SCHEDULED_LANGUAGES) == 23
    expected_codes = [
        "en", "as", "bn", "brx", "doi", "gu", "hi", "kn", "ks", "kok",
        "mai", "ml", "mni", "mr", "ne", "or", "pa", "sa", "sat", "sd",
        "ta", "te", "ur"
    ]
    for code in expected_codes:
        assert code in SCHEDULED_LANGUAGES
        assert "name" in SCHEDULED_LANGUAGES[code]
        assert "native" in SCHEDULED_LANGUAGES[code]
        assert "dir" in SCHEDULED_LANGUAGES[code]


def test_rtl_languages():
    """Confirms Urdu, Kashmiri, and Sindhi are flagged as RTL."""
    for rtl_lang in ["ur", "ks", "sd"]:
        assert rtl_lang in RTL_LANGUAGES
        assert SCHEDULED_LANGUAGES[rtl_lang]["dir"] == "rtl"


def test_script_detection():
    assert detect_language_script("ಈ ಗಿಡಮೂಲಿಕೆ") == "Kannada"
    assert detect_language_script("இந்த மூலிகை") == "Tamil"
    assert detect_language_script("ఈ మూలిక") == "Telugu"
    assert detect_language_script("ഈ ഔഷധം") == "Malayalam"
    assert detect_language_script("এই ভেষজ") == "Bengali"
    assert detect_language_script("આ ઔષધ") == "Gujarati"
    assert detect_language_script("ਇਹ ਜੜੀ-ਬੂਟੀ") == "Gurmukhi"
    assert detect_language_script("ଏହି ଔଷଧ") == "Odia"
    assert detect_language_script("یہ جڑی بوٹی") == "Perso-Arabic"
    assert detect_language_script("यह जड़ी बूटी") == "Devanagari"


def test_cross_lingual_intent_classification():
    # Patent
    assert classify_multilingual_intent("Can I patent this?") == "PATENT"
    assert classify_multilingual_intent("ಈ ಸಂಯೋಜನೆಗೆ ಪೇಟೆಂಟ್ ಪಡೆಯಬಹುದೇ?") == "PATENT"
    assert classify_multilingual_intent("இந்த மூலிகைக்கு காப்புரிமை பெற முடியுமா?") == "PATENT"
    assert classify_multilingual_intent("ఈ ఫార్ములేషన్కు పేటెంట్ పొందవచ్చా?") == "PATENT"
    assert classify_multilingual_intent("क्या इस योग का पेटेंट हो सकता है?") == "PATENT"
    assert classify_multilingual_intent("কিভাবে পেটেন্ট নেওয়া যায়?") == "PATENT"
    assert classify_multilingual_intent("یا फॉर्म्युलेशनचे पेटंट मिळेल का?") == "PATENT"
    assert classify_multilingual_intent("کیا اس کا پیٹنٹ ہو سکتا ہے؟") == "PATENT"

    # ABS
    assert classify_multilingual_intent("Do I need NBA approval?") == "ABS"
    assert classify_multilingual_intent("ಜೈವಿಕ ಸಂಪನ್ಮೂಲಕ್ಕೆ ಎನ್‌ಬಿಎ ಅನುಮತಿ ಬೇಕೇ?") == "ABS"
    assert classify_multilingual_intent("பல்லுயிர் வாரிய நன்மை பகிர்வு") == "ABS"
    assert classify_multilingual_intent("జీవవైవిధ్యం అనుమతి ఫారం III") == "ABS"
    assert classify_multilingual_intent("जैव विविधता अधिनियम के तहत लाभ साझाकरण") == "ABS"

    # Regulation
    assert classify_multilingual_intent("Rule 158B AYUSH license") == "REGULATION"
    assert classify_multilingual_intent("ಆಯುಷ್ ಲೈಸೆನ್ಸ್ ನಿಯಮ 158B") == "REGULATION"
    assert classify_multilingual_intent("ஆயுஷ் உரிமம் மற்றும் விதி 158B") == "REGULATION"


def test_classical_ayurveda_entity_extraction():
    entities = extract_ayurvedic_entities("ಅಶ್ವಗಂಧ ಮತ್ತು ಬ್ರಾಹ್ಮಿ ಸಂಯೋಜನೆ")
    assert any("Ashwagandha" in e for e in entities)
    assert any("Brahmi" in e for e in entities)

    tamil_entities = extract_ayurvedic_entities("அஸ்வகந்தா மற்றும் மஞ்சள்")
    assert any("Ashwagandha" in e for e in tamil_entities)
    assert any("Haridra" in e for e in tamil_entities)


def test_cross_lingual_rag_pipeline():
    pipeline = RAGPipeline()
    # Test Kannada query retrieval
    sources = pipeline.retrieve("ಅಶ್ವಗಂಧ ಪೇಟೆಂಟ್", top_k=2)
    assert len(sources) > 0
    assert any("3(p)" in s.get("section_number", "") for s in sources)

    # Test Tamil query retrieval
    sources_ta = pipeline.retrieve("அஸ்வகந்தா காப்புரிமை", top_k=2)
    assert len(sources_ta) > 0
    assert any("3(p)" in s.get("section_number", "") for s in sources_ta)

    # Test Localized Response Generation
    resp_kn = pipeline.answer_query("ಈ ಸಂಯೋಜನೆಗೆ ಪೇಟೆಂಟ್ ಪಡೆಯಬಹುದೇ?", language="kn")
    assert resp_kn["abstained"] is False
    assert resp_kn["detected_intent"] == "PATENT"
    assert len(resp_kn["citations"]) > 0
    assert "Section 3(p)" in resp_kn["practical_meaning"]
    assert resp_kn["is_rtl"] is False

    resp_ur = pipeline.answer_query("کیا اس کا پیٹنٹ ہو سکتا ہے؟", language="ur")
    assert resp_ur["abstained"] is False
    assert resp_ur["is_rtl"] is True
    assert "Section 3(p)" in resp_ur["practical_meaning"]


@pytest.mark.asyncio
async def test_assistant_multilingual_api_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Kannada query
        payload = {
            "query": "ಈ ಗಿಡಮೂಲಿಕೆ ಸಂಯೋಜನೆಗೆ ಪೇಟೆಂಟ್ ಪಡೆಯಬಹುದೇ?",
            "case_context": {"title": "ಮೇಧ್ಯಾ ರಸಾಯನ", "ingredients": [{"name": "Ashwagandha"}]},
            "language": "kn"
        }
        res = await client.post("/api/v1/assistant/query", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["abstained"] is False
        assert data["detected_intent"] == "PATENT"
        assert len(data["citations"]) > 0
        assert "3(p)" in data["citations"][0]["section"]
