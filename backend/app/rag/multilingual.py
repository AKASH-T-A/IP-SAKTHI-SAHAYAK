"""
IP-SAKTI Sahayak — All Indian Languages (Bharat Multilingual Engine)
SIH26045

Supports all 22 Eighth Schedule Languages of the Indian Constitution + English:
- Assamese (as), Bengali (bn), Bodo (brx), Dogri (doi), Gujarati (gu),
  Hindi (hi), Kannada (kn), Kashmiri (ks), Konkani (kok), Maithili (mai),
  Malayalam (ml), Manipuri (mni), Marathi (mr), Nepali (ne), Odia (or),
  Punjabi (pa), Sanskrit (sa), Santali (sat), Sindhi (sd), Tamil (ta),
  Telugu (te), Urdu (ur), English (en - canonical).

Core Rules:
1. Canonical Legal Identifiers (e.g., Section 3(p), Rule 158B, Form III, Patents Act 1970) are NEVER translated.
2. Classical Sanskrit Ayurveda terms (e.g., Rasayana, Churna, Taila, Bhasma, Dravya) are preserved.
3. Cross-lingual retrieval maps native queries to canonical statutory corpus.
4. Explanations are localized while citations remain authoritative.
"""
import re
from typing import Dict, Any, List, Optional, Tuple

# ─── Language Metadata Registry ───────────────────────────────────────────────

SCHEDULED_LANGUAGES: Dict[str, Dict[str, Any]] = {
    "en": {"name": "English", "native": "English", "script": "Latin", "dir": "ltr"},
    "as": {"name": "Assamese", "native": "অসমীয়া", "script": "Bengali", "dir": "ltr"},
    "bn": {"name": "Bengali", "native": "বাংলা", "script": "Bengali", "dir": "ltr"},
    "brx": {"name": "Bodo", "native": "बड़ो", "script": "Devanagari", "dir": "ltr"},
    "doi": {"name": "Dogri", "native": "डोगरी", "script": "Devanagari", "dir": "ltr"},
    "gu": {"name": "Gujarati", "native": "ગુજરાતી", "script": "Gujarati", "dir": "ltr"},
    "hi": {"name": "Hindi", "native": "हिन्दी", "script": "Devanagari", "dir": "ltr"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ", "script": "Kannada", "dir": "ltr"},
    "ks": {"name": "Kashmiri", "native": "کٲشُر / कश्मीरी", "script": "Perso-Arabic", "dir": "rtl"},
    "kok": {"name": "Konkani", "native": "कोंकणी", "script": "Devanagari", "dir": "ltr"},
    "mai": {"name": "Maithili", "native": "मैथिली", "script": "Devanagari", "dir": "ltr"},
    "ml": {"name": "Malayalam", "native": "മലയാളം", "script": "Malayalam", "dir": "ltr"},
    "mni": {"name": "Manipuri", "native": "মৈতৈলোন্ / মণিপুরী", "script": "Bengali", "dir": "ltr"},
    "mr": {"name": "Marathi", "native": "मराठी", "script": "Devanagari", "dir": "ltr"},
    "ne": {"name": "Nepali", "native": "नेपाली", "script": "Devanagari", "dir": "ltr"},
    "or": {"name": "Odia", "native": "ଓଡ଼ିଆ", "script": "Odia", "dir": "ltr"},
    "pa": {"name": "Punjabi", "native": "ਪੰਜਾਬੀ", "script": "Gurmukhi", "dir": "ltr"},
    "sa": {"name": "Sanskrit", "native": "संस्कृतम्", "script": "Devanagari", "dir": "ltr"},
    "sat": {"name": "Santali", "native": "ᱥᱟᱱᱛᱟᱲᱤ", "script": "Ol Chiki", "dir": "ltr"},
    "sd": {"name": "Sindhi", "native": "سنڌي / सिन्धी", "script": "Perso-Arabic", "dir": "rtl"},
    "ta": {"name": "Tamil", "native": "தமிழ்", "script": "Tamil", "dir": "ltr"},
    "te": {"name": "Telugu", "native": "తెలుగు", "script": "Telugu", "dir": "ltr"},
    "ur": {"name": "Urdu", "native": "اردو", "script": "Perso-Arabic", "dir": "rtl"},
}

RTL_LANGUAGES = {"ur", "ks", "sd"}

# ─── Script Detection by Unicode Block ────────────────────────────────────────

SCRIPT_RANGES = [
    ("Kannada", re.compile(r"[\u0C80-\u0CFF]")),
    ("Tamil", re.compile(r"[\u0B80-\u0BFF]")),
    ("Telugu", re.compile(r"[\u0C00-\u0C7F]")),
    ("Malayalam", re.compile(r"[\u0D00-\u0D7F]")),
    ("Gurmukhi", re.compile(r"[\u0A00-\u0A7F]")),
    ("Gujarati", re.compile(r"[\u0A80-\u0AFF]")),
    ("Odia", re.compile(r"[\u0B00-\u0B7F]")),
    ("Bengali", re.compile(r"[\u0980-\u09FF]")),
    ("Perso-Arabic", re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")),
    ("OlChiki", re.compile(r"[\u1C50-\u1C7F]")),
    ("Devanagari", re.compile(r"[\u0900-\u097F]")),
]


def detect_language_script(text: str) -> str:
    """Detects primary script from Unicode blocks in the text."""
    for script_name, regex in SCRIPT_RANGES:
        if regex.search(text):
            return script_name
    return "Latin"


def infer_language_from_text(text: str, default: str = "en") -> str:
    """Infers language code from script heuristics."""
    script = detect_language_script(text)
    mapping = {
        "Kannada": "kn",
        "Tamil": "ta",
        "Telugu": "te",
        "Malayalam": "ml",
        "Gurmukhi": "pa",
        "Gujarati": "gu",
        "Odia": "or",
        "Bengali": "bn",
        "Perso-Arabic": "ur",
        "OlChiki": "sat",
        "Devanagari": "hi",
    }
    return mapping.get(script, default)


# ─── Cross-Lingual Intent Keywords ───────────────────────────────────────────

MULTILINGUAL_INTENTS: Dict[str, List[str]] = {
    "PATENT": [
        # English
        "patent", "invent", "novel", "3(p)", "3(e)", "claim", "infringement", "prior art",
        # Kannada
        "ಪೇಟೆಂಟ್", "ಪೇಟೆಂಟು", "ಆವಿಷ್ಕಾರ", "ನಾವೀನ್ಯತೆ", "ಹಕ್ಕುಸ್ವಾಮ್ಯ", "ಮುಂಚಿತ ಕಲೆ",
        # Tamil
        "காப்புரிமை", "புதிய கண்டுபிடிப்பு", "கண்டுபிடிப்பு", "புதுமை", "முந்தைய கலை",
        # Telugu
        "పేటెంట్", "పేటెంటు", "ఆవిష్కరణ", "నవీనత", "ముందస్తు కళ",
        # Hindi / Devanagari (Sanskrit, Marathi, etc.)
        "पेटेंट", "आविष्कार", "नवीनता", "पूर्व कला", "अधिकार",
        # Malayalam
        "പേറ്റന്റ്", "കണ്ടുപിടുത്തം", "നവീനത", "മുൻകാല കല",
        # Bengali / Assamese
        "পেটেন্ট", "আবিষ্কার", "উদ্ভাবন", "অভিনবত্ব", "পূর্ববর্তী শিল্প",
        # Marathi
        "पेटंट", "शोध", "नाविन्यता", "पूर्वकला",
        # Gujarati
        "પેટન્ટ", "શોધ", "નવીનતા",
        # Punjabi
        "ਪੇਟੈਂਟ", "ਖੋਜ", "ਨਵੀਨਤਾ",
        # Odia
        "ପେଟେଣ୍ଟ", "ଆବିଷ୍କାର", "ନୂତନତା",
        # Urdu / Perso-Arabic
        "پیٹنٹ", "ایجاد", "جدت", "حقوق ایجاد",
    ],
    "ABS": [
        # English
        "abs", "biodiversity", "nba", "sbb", "form iii", "benefit sharing", "biological resource",
        # Kannada
        "ಜೀವವೈವಿಧ್ಯ", "ಜೈವಿಕ ಸಂಪನ್ಮೂಲ", "ಪ್ರಯೋಜನ ಹಂಚಿಕೆ", "ಎನ್‌ಬಿಎ", "ಫಾರ್ಮ್ 3", "ಫಾರ್ಮ್ III",
        # Tamil
        "பல்லுயிர்", "உயிரியல் வளம்", "நன்மை பகிர்வு", "என்பிஏ", "படிவம் 3", "படிவம் III",
        # Telugu
        "జీవవైవిధ్యం", "జీవ వనరులు", "ప్రయోజన భాగస్వామ్యం", "ఎన్‌బీఏ", "ఫారం 3", "ఫారం III",
        # Hindi
        "जैव विविधता", "जैविक संसाधन", "लाभ साझाकरण", "एनबीए", "फॉर्म III", "फॉर्म 3",
        # Malayalam
        "ജൈവവൈവിധ്യം", "ജൈവ വിഭവങ്ങൾ", "എൻബിഎ", "ഫോം III",
        # Bengali
        "জীববৈচিত্র্য", "জৈব সম্পদ", "এনবিএ", "ফর্ম ৩",
        # Marathi
        "जैवविविधता", "जैविक संसाधने", "एनबीए", "फॉर्म III",
        # Gujarati
        "જૈવવિવિધતા", "જૈવિક સંસાધનો", "એનબીએ",
        # Punjabi
        "ਜੈਵ ਵਿਭਿੰਨਤਾ", "ਜੈਵਿਕ ਸਰੋਤ",
        # Odia
        "ଜୈବବିବିଧତା", "ଜୈବିକ ସମ୍ବଳ",
        # Urdu
        "حیاتیاتی تنوع", "حیاتیاتی وسائل", "این بی اے", "فارم 3",
    ],
    "REGULATION": [
        # English
        "ayush", "fssai", "license", "licensing", "158b", "aahar", "gmp", "schedule t", "rule 158",
        # Kannada
        "ಆಯುಷ್", "ಪರವಾನಗಿ", "ನಿಯಮಾವಳಿ", "ನಿಯಮ 158b", "ಜಿಎಂಪಿ", "ಅನುಮೋದನೆ",
        # Tamil
        "ஆயுஷ்", "உரிமம்", "ஒழுங்குமுறை", "விதி 158B", "அனுமதி", "ஜிஎம்பி",
        # Telugu
        "ఆయుష్", "లైసెన్స్", "నియంత్రణ", "నిబంధన 158B", "జిఎమ్‌పి",
        # Hindi
        "आयुष", "लाइसेंस", "विनियमन", "नियम 158B", "जीएमपी", "अनुमति", "शेड्यूल T",
        # Bengali
        "আয়ুষ", "লাইসেন্স", "নিয়ন্ত্রণ", "বিধি ১৫৮বি",
        # Marathi
        "आयुष", "परवाना", "नियमन", "नियम १५८बी", "जीएमपी",
        # Gujarati
        "આયુષ", "લાયસન્સ", "નિયમન", "નિયમ 158B",
        # Malayalam
        "ആയുഷ്", "ലൈസൻസ്", "റെഗുലേഷൻ", "ചട്ടം 158B",
        # Urdu
        "آیوُش", "لائسنس", "ضابطہ", "قاعدہ 158B",
    ],
    "TRADEMARK": [
        # English
        "trademark", "brand", "logo", "brand name", "class 5",
        # Kannada
        "ಟ್ರೇಡ್‌ಮಾರ್ಕ್", "ಬ್ರಾಂಡ್", "ಲಾಂಛನ", "ಮುದ್ರೆ",
        # Tamil
        "வர்த்தக முத்திரை", "வணிக முத்திரை", "பிராண்ட்",
        # Telugu
        "ట్రేడ్‌మార్క్", "ట్రేడ్ మార్క్", "బ్రాండ్", "చిహ్నం",
        # Hindi
        "ट्रेडमार्क", "ब्रांड", "प्रतीक चिन्ह", "व्यापार चिह्न",
        # Bengali
        "ট্রেডমার্ক", "ব্র্যান্ড", "লোগো",
        # Marathi
        "ट्रेडमार्क", "ब्रँड", "व्यापारी चिन्ह",
        # Urdu
        "ٹریڈ مارک", "برانڈ", "لوگو",
    ],
    "GI": [
        # English
        "gi", "geographical indication", "geographical", "origin", "darjeeling", "kashmiri",
        # Kannada
        "ಭೌಗೋಳಿಕ ಸೂಚ್ಯಂಕ", "ಮೂಲ ಪ್ರದೇಶ", "ಜಿಐ",
        # Tamil
        "புவிசார் குறியீடு", "மூல இடம்", "ஜிஐ",
        # Telugu
        "భౌగోళిక సూచిక", "మూల ప్రదేశం", "జిఐ",
        # Hindi
        "भौगोलिक उपदर्शन", "भौगोलिक संकेत", "जीआई",
        # Bengali
        "ভৌগোলিক নির্দেশক", "উৎপত্তিস্থল", "জিআই",
        # Marathi
        "भौगोलिक निर्देशांक", "उत्पत्ती स्थान", "जीआय",
        # Urdu
        "جغرافیائی اشاریہ", "مقام پیدائش", "جی آئی",
    ],
    "TRADITIONAL_KNOWLEDGE": [
        # English
        "tk", "traditional knowledge", "tkdl", "samhita", "treatise", "classical",
        # Kannada
        "ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ", "ಸಂಹಿತಾ", "ಶಾಸ್ತ್ರೀಯ", "ಗ್ರಂಥ",
        # Tamil
        "பாரம்பரிய அறிவு", "சம்ஹிதை", "சாஸ்திர", "பழங்கால நூல்",
        # Telugu
        "సంప్రదాయ జ్ఞానం", "సంహిత", "శాస్త్రీయ గ్రంథం",
        # Hindi
        "पारंपरिक ज्ञान", "संहिता", "ग्रंथ", "टीकेडीएल", "शास्त्रीय",
        # Bengali
        "ঐতিহ্যগত জ্ঞান", "সংহিতা", "শাস্ত্রীয় গ্রন্থ",
        # Marathi
        "पारंपारिक ज्ञान", "संहिता", "ग्रंथ",
        # Urdu
        "روایتی علم", "صحیفہ", "قدیم کتاب",
    ]
}


def classify_multilingual_intent(query: str) -> str:
    """Classifies statutory intent across all Indian languages."""
    q_lower = query.lower()
    for intent, keywords in MULTILINGUAL_INTENTS.items():
        for kw in keywords:
            if kw.lower() in q_lower:
                return intent
    return "GENERAL_QUESTION"


# ─── Classical Ayurveda Entity Normalization ──────────────────────────────────

AYURVEDA_HERB_MAP: Dict[str, str] = {
    # Ashwagandha
    "ಅಶ್ವಗಂಧ": "Ashwagandha (Withania somnifera)",
    "அஸ்வகந்தா": "Ashwagandha (Withania somnifera)",
    "అశ్వగంధ": "Ashwagandha (Withania somnifera)",
    "अश्वगंधा": "Ashwagandha (Withania somnifera)",
    "অশ্বগন্ধা": "Ashwagandha (Withania somnifera)",
    "અશ્વગંધા": "Ashwagandha (Withania somnifera)",
    "ਅਸ਼ਵਗੰਧਾ": "Ashwagandha (Withania somnifera)",
    "ଅଶ୍ୱଗନ୍ଧା": "Ashwagandha (Withania somnifera)",
    "അശ്വഗന്ധ": "Ashwagandha (Withania somnifera)",
    "اشوگندھا": "Ashwagandha (Withania somnifera)",
    "ashwagandha": "Ashwagandha (Withania somnifera)",

    # Brahmi
    "ಬ್ರಾಹ್ಮಿ": "Brahmi (Bacopa monnieri)",
    "பிராமி": "Brahmi (Bacopa monnieri)",
    "బ్రాహ్మి": "Brahmi (Bacopa monnieri)",
    "ब्राह्मी": "Brahmi (Bacopa monnieri)",
    "ব্রাহ্মী": "Brahmi (Bacopa monnieri)",
    "બ્રાહ્મી": "Brahmi (Bacopa monnieri)",
    "brahmi": "Brahmi (Bacopa monnieri)",

    # Guduchi / Giloy
    "ಗುಡುಚಿ": "Guduchi (Tinospora cordifolia)",
    "குடூசி": "Guduchi (Tinospora cordifolia)",
    "గుడుచి": "Guduchi (Tinospora cordifolia)",
    "गुडूची": "Guduchi (Tinospora cordifolia)",
    "गिलोय": "Guduchi (Tinospora cordifolia)",
    "গিলয়": "Guduchi (Tinospora cordifolia)",
    "ગિલોય": "Guduchi (Tinospora cordifolia)",
    "guduchi": "Guduchi (Tinospora cordifolia)",
    "giloy": "Guduchi (Tinospora cordifolia)",

    # Haridra / Turmeric
    "ಹರಿದ್ರಾ": "Haridra (Curcuma longa)",
    "மஞ்சள்": "Haridra (Curcuma longa)",
    "పసుపు": "Haridra (Curcuma longa)",
    "हरिद्रा": "Haridra (Curcuma longa)",
    "हल्दी": "Haridra (Curcuma longa)",
    "হলুদ": "Haridra (Curcuma longa)",
    "હળદર": "Haridra (Curcuma longa)",
    "haridra": "Haridra (Curcuma longa)",
    "turmeric": "Haridra (Curcuma longa)",

    # Triphala
    "ತ್ರಿಫಲಾ": "Triphala",
    "திரிபலா": "Triphala",
    "త్రిఫల": "Triphala",
    "त्रिफला": "Triphala",
    "ত্রিফলা": "Triphala",
    "ત્રિફળા": "Triphala",
    "triphala": "Triphala",
}


def extract_ayurvedic_entities(text: str) -> List[str]:
    """Extracts and canonicalizes Ayurvedic botanical entities from multilingual text."""
    found = []
    text_lower = text.lower()
    for local_term, canonical in AYURVEDA_HERB_MAP.items():
        if local_term.lower() in text_lower and canonical not in found:
            found.append(canonical)
    return found


def normalize_query_for_retrieval(query: str) -> str:
    """
    Normalizes a query from any Indian language into canonical retrieval keywords
    so hybrid BM25 and vector search match authoritative statutory corpus records.
    """
    detected_entities = extract_ayurvedic_entities(query)
    detected_intent = classify_multilingual_intent(query)

    canonical_parts = []
    if detected_intent == "PATENT":
        canonical_parts.append("Section 3(p) Patent Act traditional knowledge synergy non-obvious")
    elif detected_intent == "ABS":
        canonical_parts.append("Biological Diversity Act NBA Form III Section 6 benefit sharing")
    elif detected_intent == "REGULATION":
        canonical_parts.append("Rule 158B Drugs Cosmetics Act AYUSH license classical proprietary")
    elif detected_intent == "TRADEMARK":
        canonical_parts.append("Trade Marks Act Class 5 distinctiveness deceptive similarity")
    elif detected_intent == "GI":
        canonical_parts.append("Geographical Indications Act origin reputation proof")
    elif detected_intent == "TRADITIONAL_KNOWLEDGE":
        canonical_parts.append("Traditional Knowledge Digital Library TKDL ancient treatises prior art")

    if detected_entities:
        canonical_parts.extend(detected_entities)
    else:
        canonical_parts.append(query)

    return " ".join(canonical_parts)


# ─── Localized Response Generation Templates ──────────────────────────────────

LOCALIZED_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "kn": {
        "disclaimer": "ಅನುವಾದಿತ ವಿವರಣೆಯು ಅನುಕೂಲಕ್ಕಾಗಿ ಮಾತ್ರ. ಅಧಿಕೃತ ಕಾನೂನು ಪಠ್ಯಕ್ಕಾಗಿ ಉಲ್ಲೇಖಿಸಲಾದ ಮೂಲವನ್ನು ನೋಡಿ.",
        "answer": "{case_title} ({ing_summary}) ಕುರಿತಂತೆ, ಶಾಸನಬದ್ಧ ವಿಶ್ಲೇಷಣೆಯು {source_title} ಅಡಿಯಲ್ಲಿ ಬರುವ ಕಾನೂನು ನಿಬಂಧನೆಗಳು ಅನ್ವಯಿಸುತ್ತವೆ ಎಂದು ಸ್ಪಷ್ಟಪಡಿಸುತ್ತದೆ.",
        "why": "ಈ ತೀರ್ಮಾನವು {authority} ಹೊರಡಿಸಿದ ಶಾಸನಬದ್ಧ ನಿಬಂಧನೆಗಳನ್ನು ಆಧರಿಸಿದೆ.",
        "practical_meaning": "ಸಾಂಪ್ರದಾಯಿಕ ಗಿಡಮೂಲಿಕೆಗಳ ಕೇವಲ ಮಿಶ್ರಣವು Section 3(p) ಅಡಿಯಲ್ಲಿ ಪೇಟೆಂಟ್‌ಗೆ ಅರ್ಹವಲ್ಲ; ಅನಿರೀಕ್ಷಿತ ಸಹಕ್ರಿಯೆ (Synergy) ಸಾಬೀತುಪಡಿಸಬೇಕು.",
        "missing_info": [
            "ಶಾಸ್ತ್ರೀಯ ಆಯುರ್ವೇದ ಗ್ರಂಥದ ನಿಖರವಾದ ಅಧ್ಯಾಯ ಮತ್ತು ಶ್ಲೋಕ ಉಲ್ಲೇಖ",
            "ಸಹಕ್ರಿಯಾತ್ಮಕ ಫಲಿತಾಂಶವನ್ನು ಸಾಬೀತುಪಡಿಸುವ ಪ್ರಾಯೋಗಿಕ ಡೇಟಾ (ಪೇಟೆಂಟ್ ಕೋರಿದ್ದಲ್ಲಿ)"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act ನ Schedule 1 ಗ್ರಂಥಗಳ ವಿವರವನ್ನು ದೃಢೀಕರಿಸಿ",
            "ಭಾರತೀಯ ಜೈವಿಕ ಸಂಪನ್ಮೂಲ ಬಳಸಿದ್ದರೆ NBA Form III ಅನುಮೋದನೆ ಪರಿಶೀಲಿಸಿ"
        ]
    },
    "ta": {
        "disclaimer": "மொழிபெயர்க்கப்பட்ட விளக்கம் வசதிக்காக மட்டுமே. அதிகாரப்பூர்வ சட்டப் பதிப்பிற்கு குறிப்பிடப்பட்ட மூலத்தைப் பார்க்கவும்.",
        "answer": "{case_title} ({ing_summary}) குறித்து, சட்டரீதியான பகுப்பாய்வு {source_title} கீழ் உள்ள விதிகள் பொருந்தும் என்பதை உறுதிப்படுத்துகிறது.",
        "why": "{authority} வெளியிட்ட சட்டப்பூர்வ விதிகளின் அடிப்படையில் இந்த முடிவு அமைந்துள்ளது.",
        "practical_meaning": "பாரம்பரிய மூலிகைகளின் எளிய கலவை Section 3(p) கீழ் காப்புரிமைக்கு தகுதியற்றது; எதிர்பாராத ஒருங்கிணைந்த நன்மையை (Synergy) நிரூபிக்க வேண்டும்.",
        "missing_info": [
            "பாரம்பரிய மருத்துவ நூலின் அத்தியாயம் மற்றும் சுலோக குறிப்பு",
            "ஒருங்கிணைந்த செயல்திறனை (Synergy) நிரூபிக்கும் ஆய்வக தரவு"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act அட்டவணை 1 இல் உள்ள மருத்துவ நூலை சரிபார்க்கவும்",
            "இந்திய உயிரியல் வளங்களை பயன்படுத்தினால் NBA Form III அனுமதி பெறவும்"
        ]
    },
    "te": {
        "disclaimer": "అనువదించబడిన వివరణ సౌలభ్యం కొరకు మాత్రమే. అధికారిక చట్టబద్ధమైన పాఠం కోసం ఉదహరించిన మూలాన్ని చూడండి.",
        "answer": "{case_title} ({ing_summary}) సంబంధించి, చట్టపరమైన విశ్లేషణ {source_title} నిబంధనలు వర్తిస్తాయని స్పష్టం చేస్తోంది.",
        "why": "{authority} ద్వారా జారీ చేయబడిన చట్టపరమైన నిబంధనల ఆధారంగా ఈ ఫలితం నిర్ధారించబడింది.",
        "practical_meaning": "సాంప్రదాయ ఔషధాల సాధారణ మిశ్రమానికి Section 3(p) కింద పేటెంట్ లభించదు; ఊహించని సినర్జీ (Synergy) రుజువు చేయాలి.",
        "missing_info": [
            "సంబంధిత ప్రామాణిక ఆయుర్వేద గ్రంథంలోని అధ్యాయం మరియు శ్లోక సూచన",
            "సినర్జిస్టిక్ ప్రభావాన్ని నిరూపించే ప్రయోగశాల డేటా"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act లోని Schedule 1 గ్రంథాల వివరాలు సరిచూడండి",
            "భారతీయ జీవ వనరుల వినియోగం ఉన్నట్లయితే NBA Form III అనుమతిని సమీక్షించండి"
        ]
    },
    "ml": {
        "disclaimer": "വിവർത്തനം ചെയ്ത വിശദീകരണം സൗകര്യത്തിന് മാത്രമാണ്. ആധികാരിക നിയമ പാഠത്തിനായി ബന്ധപ്പെട്ട ഔദ്യോഗിക രേഖ കാണുക.",
        "answer": "{case_title} ({ing_summary}) സംബന്ധിച്ച്, {source_title} വ്യവസ്ഥകൾ ബാധകമാണെന്ന് നിയമപരമായ വിശകലനം വ്യക്തമാക്കുന്നു.",
        "why": "{authority} പുറപ്പെടുവിച്ച നിയമപരമായ വ്യവസ്ഥകളെ അടിസ്ഥാനമാക്കിയാണ് ഇത്.",
        "practical_meaning": "പരമ്പരാഗത സസ്യങ്ങളുടെ ലളിതമായ മിശ്രിതം Section 3(p) പ്രകാരം പേറ്റന്റിന് അർഹമല്ല; അപ്രതീക്ഷിത സിനർജി (Synergy) തെളിയിക്കണം.",
        "missing_info": [
            "ആധികാരിക ഗ്രന്ഥത്തിലെ അധ്യായവും ശ്ലോകവും സംബന്ധിച്ച വിവരങ്ങൾ",
            "സിനർജറ്റിക് ഫലം തെളിയിക്കുന്ന പരീക്ഷണ ഡാറ്റ"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act ലെ Schedule 1 ഗ്രന്ഥങ്ങൾ പരിശോധിക്കുക",
            "ഇന്ത്യൻ ജൈവവിഭവങ്ങൾ ഉപയോഗിച്ചിട്ടുണ്ടെങ്കിൽ NBA Form III അനുമതി നേടുക"
        ]
    },
    "bn": {
        "disclaimer": "অনূদিত ব্যাখ্যাটি কেবল সুবিধার জন্য। প্রামাণ্য আইনি পাঠ্যের জন্য উল্লিখিত অফিসিয়াল উৎসটি দেখুন।",
        "answer": "{case_title} ({ing_summary}) এর ক্ষেত্রে, বিধিবদ্ধ বিশ্লেষণ নির্দেশ করে যে {source_title} এর বিধানগুলি প্রযোজ্য।",
        "why": "এটি {authority} দ্বারা জারি করা বিধিবদ্ধ বিধানের উপর প্রতিষ্ঠিত।",
        "practical_meaning": "ঐতিহ্যগত ভেষজগুলির নিছক মিশ্রণ Section 3(p) এর অধীনে পেটেন্টের যোগ্য নয়; অপ্রত্যাশিত সমন্বয় (Synergy) প্রমাণ করতে হবে।",
        "missing_info": [
            "শাস্ত্রীয় আয়ুর্বেদিক গ্রন্থের সুনির্দিষ্ট অধ্যায় ও শ্লোক সূত্র",
            "সিনার্জিস্টিক কার্যকারিতা প্রমাণের পরীক্ষামূলক তথ্য"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act এর Schedule 1 অন্তর্ভুক্ত গ্রন্থের বিবরণ যাচাই করুন",
            "ভারতীয় জৈব সম্পদ ব্যবহারে NBA Form III অনুমোদনের প্রয়োজনীয়তা পর্যালোচনা করুন"
        ]
    },
    "mr": {
        "disclaimer": "अनुवादित स्पष्टीकरण केवळ सोयीसाठी आहे. अधिकृत कायदेशीर मजकुरासाठी संदर्भित मूळ स्रोत पहा.",
        "answer": "{case_title} ({ing_summary}) च्या संदर्भात, वैधानिक विश्लेषण स्पष्ट करते की {source_title} मधील तरतुदी लागू होतात.",
        "why": "{authority} द्वारे जारी केलेल्या वैधानिक तरतुदींवर हा निष्कर्ष आधारित आहे.",
        "practical_meaning": "पारंपारिक वनस्पतींचे साधे मिश्रण Section 3(p) अंतर्गत पेटंटसाठी पात्र नाही; अनपेक्षित सहक्रियाशीलता (Synergy) सिद्ध करावी लागेल.",
        "missing_info": [
            "प्रमाणित आयुर्वेदिक ग्रंथातील अचूक अध्याय व श्लोक संदर्भ",
            "सहक्रियाशीलता (Synergy) सिद्ध करणारा प्रायोगिक डेटा"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act च्या Schedule 1 मधील ग्रंथांची माहिती तपासा",
            "भारतीय जैविक संसाधने वापरत असल्यास NBA Form III मंजुरीची पडताळणी करा"
        ]
    },
    "gu": {
        "disclaimer": "અનુવાદિત સમજૂતી માત્ર સુવિધા માટે છે. સત્તાવાર કાનૂની લખાણ માટે સંદર્ભિત સ્ત્રોત જુઓ.",
        "answer": "{case_title} ({ing_summary}) ના સંદર્ભમાં, કાનૂની વિશ્લેષણ સ્પષ્ટ કરે છે કે {source_title} ની જોગવાઈઓ લાગુ પડે છે.",
        "why": "{authority} દ્વારા જારી કરાયેલ કાનૂની જોગવાઈઓ પર આ આધારિત છે.",
        "practical_meaning": "પરંપરાગત ઔષધિઓનું માત્ર મિશ્રણ Section 3(p) હેઠળ પેટન્ટ માટે યોગ્ય નથી; અણધારી સહક્રિયાત્મકતા (Synergy) સાબિત કરવી પડશે.",
        "missing_info": [
            "શાસ્ત્રીય આયુર્વેદિક ગ્રંથનો ચોક્કસ અધ્યાય અને શ્લોક સંદર્ભ",
            "સિનર્જિસ્ટિક અસર સાબિત કરતો પ્રાયોગિક ડેટા"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act ના Schedule 1 ગ્રંથોની વિગતો તપાસો",
            "ભારતીય જૈવિક સંસાધનો માટે NBA Form III મંજૂરી ચકાસો"
        ]
    },
    "pa": {
        "disclaimer": "ਅਨੁਵਾਦ ਕੀਤੀ ਵਿਆਖਿਆ ਕੇਵਲ ਸਹੂਲਤ ਲਈ ਹੈ। ਪ੍ਰਮਾਣਿਕ ਕਾਨੂੰਨੀ ਦਸਤਾਵੇਜ਼ ਲਈ ਸੰਦਰਭਿਤ ਅਧਿਕਾਰਤ ਸਰੋਤ ਦੇਖੋ।",
        "answer": "{case_title} ({ing_summary}) ਦੇ ਸੰਬੰਧ ਵਿੱਚ, ਕਾਨੂੰਨੀ ਵਿਸ਼ਲੇਸ਼ਣ ਸਪੱਸ਼ਟ ਕਰਦਾ ਹੈ ਕਿ {source_title} ਦੇ ਉਪਬੰਧ ਲਾਗੂ ਹੁੰਦੇ ਹਨ।",
        "why": "{authority} ਦੁਆਰਾ ਜਾਰੀ ਕਾਨੂੰਨੀ ਨਿਯਮਾਂ ਦੇ ਆਧਾਰ 'ਤੇ ਇਹ ਸਿੱਟਾ ਕੱਢਿਆ ਗਿਆ ਹੈ।",
        "practical_meaning": "ਰਵਾਇਤੀ ਜੜੀ-ਬੂਟੀਆਂ ਦਾ ਸਿਰਫ਼ ਮਿਸ਼ਰਣ Section 3(p) ਅਧੀਨ ਪੇਟੈਂਟ ਯੋਗ ਨਹੀਂ ਹੈ; ਅਣਕਿਆਸੀ ਸਿਨਰਜੀ (Synergy) ਸਾਬਤ ਕਰਨੀ ਪਵੇਗੀ।",
        "missing_info": [
            "ਪ੍ਰਮਾਣਿਕ ਆਯੁਰਵੈਦਿਕ ਗ੍ਰੰਥ ਦਾ ਅਧਿਆਇ ਅਤੇ ਸ਼ਲੋਕ ਸੰਦਰਭ",
            "ਸਹਿ-ਕਿਰਿਆਸ਼ੀਲਤਾ (Synergy) ਸਾਬਤ ਕਰਨ ਵਾਲਾ ਪ੍ਰਯੋਗਸ਼ਾਲਾ ਡੇਟਾ"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act ਦੇ Schedule 1 ਅਧੀਨ ਗ੍ਰੰਥਾਂ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
            "ਭਾਰਤੀ ਜੈਵਿਕ ਸਰੋਤਾਂ ਲਈ NBA Form III ਪ੍ਰਵਾਨਗੀ ਦੀ ਸਮੀਖਿਆ ਕਰੋ"
        ]
    },
    "or": {
        "disclaimer": "ଅନୁବାଦିତ ବ୍ୟାଖ୍ୟା କେବଳ ସୁବିଧା ପାଇଁ। ପ୍ରାମାଣିକ ଆଇନଗତ ପାଠ୍ୟ ପାଇଁ ସରକାରୀ ଉତ୍ସ ଦେଖନ୍ତୁ।",
        "answer": "{case_title} ({ing_summary}) ସମ୍ବନ୍ଧରେ, ଆଇନଗତ ବିଶ୍ଳେଷଣ ସ୍ପଷ୍ଟ କରେ ଯେ {source_title} ର ନିୟମାବଳୀ ପ୍ରଯୁଜ୍ୟ।",
        "why": "{authority} ଦ୍ୱାରା ଜାରି କରାଯାଇଥିବା ଆଇନଗତ ପ୍ରାବଧାନ ଉପରେ ଏହା ଆଧାରିତ।",
        "practical_meaning": "ପାରମ୍ପରିକ ଔଷଧିର କେବଳ ମିଶ୍ରଣ Section 3(p) ଅଧୀନରେ ପେଟେଣ୍ଟ ଯୋଗ୍ୟ ନୁହେଁ; ସିନର୍ଜି (Synergy) ପ୍ରମାଣିତ କରିବା ଆବଶ୍ୟକ।",
        "missing_info": [
            "ଶାସ୍ତ୍ରୀୟ ଆୟୁର୍ବେଦିକ ଗ୍ରନ୍ଥର ଅଧ୍ୟାୟ ଏବଂ ଶ୍ଳୋକ ଉଲ୍ଲେଖ",
            "ସିନର୍ଜି ପ୍ରମାଣିତ କରୁଥିବା ପରୀକ୍ଷାମୂଳକ ତଥ୍ୟ"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act ର Schedule 1 ଅନୁସୂଚୀ ଯାଞ୍ଚ କରନ୍ତୁ",
            "ଜୈବିକ ସମ୍ବଳ ବ୍ୟବହାର ପାଇଁ NBA Form III ଅନୁମୋଦନ ସମୀକ୍ଷା କରନ୍ତୁ"
        ]
    },
    "as": {
        "disclaimer": "অনূদিত ব্যাখ্যা কেৱল সুবিধাৰ বাবে। প্ৰামাণিক আইনী পাঠ্যৰ বাবে উল্লেখিত চৰকাৰী উৎস চাওক।",
        "answer": "{case_title} ({ing_summary}) ৰ ক্ষেত্ৰত, বিধিবদ্ধ বিশ্লেষণে স্পষ্ট কৰে যে {source_title} ৰ বিধানসমূহ প্ৰযোজ্য।",
        "why": "{authority} দ্বাৰা প্ৰদান কৰা বিধিবদ্ধ ব্যৱস্থাৰ ওপৰত এই তথ্য আধাৰিত।",
        "practical_meaning": "পৰম্পৰাগত ঔষধৰ সাধাৰণ মিশ্ৰণ Section 3(p) ৰ অধীনত পেটেণ্টযোগ্য নহয়; সমন্বিত কাৰ্যকাৰিতা (Synergy) প্ৰমাণ কৰিব লাগিব।",
        "missing_info": [
            "প্ৰামাণিক আয়ুৰ্বেদিক গ্ৰন্থৰ অধ্যায় আৰু শ্লোকৰ তথ্য",
            "কাৰ্যকাৰিতা প্ৰমাণৰ পৰীক্ষাগাৰ তথ্য"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act ৰ Schedule 1 গ্ৰন্থসমূহ পৰীক্ষা কৰক",
            "জৈৱ সম্পদ ব্যৱহাৰৰ বাবে NBA Form III অনুমোদন পৰ্যালোচনা কৰক"
        ]
    },
    "ur": {
        "disclaimer": "ترجمہ شدہ وضاحت محض سہولت کے لیے ہے۔ مستند قانونی متن کے لیے متعلقہ سرکاری ماخذ ملاحظہ فرمائیں۔",
        "answer": "{case_title} ({ing_summary}) کے سلسلے میں، قانونی تجزیہ واضح کرتا ہے کہ {source_title} کی دفعات لاگو ہوتی ہیں۔",
        "why": "یہ فیصلہ {authority} کے مجاز قانونی احکامات پر مبنی ہے۔",
        "practical_meaning": "روایتی جڑی بوٹیوں کی محض آمیزش Section 3(p) کے تحت پیٹنٹ کے لائق نہیں؛ غیر متوقع ہم آہنگی (Synergy) ثابت کرنا ضروری ہے۔",
        "missing_info": [
            "کلاسک آیورویدک کتب کا باب اور شلوک حوالہ",
            "ہم آہنگی (Synergy) کو ثابت کرنے والا تجرباتی ڈیٹا"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act کے Schedule 1 میں درج کتب کی تصدیق کریں",
            "حیاتیاتی وسائل کے استعمال کے لیے NBA Form III منظوری چیک کریں"
        ]
    },
    "sa": {
        "disclaimer": "অনূদিতံ বিবরণং সৌকর্যায় এব। প্রামাণিকায় বৈধানিকপাঠায় নির্দিষ্টম্ অধিকারিকমূলং পশ্যতু।",
        "answer": "{case_title} ({ing_summary}) विषये, वैधानिक-विश्लेषणेन स्पष्टीक्रियते यत् {source_title} नियमाः प्रयोज्याः सन्ति।",
        "why": "{authority} प्राधिकारेण प्रख्यापित-वैधानिक-नियमेषु आधारितम् इदम्।",
        "practical_meaning": "पारम्परिक-द्रव्याणां केवलं मिश्रणं Section 3(p) अन्तः पेटेण्ट-योग्यं न भवति; अपूर्वा सहक्रियाशीलता (Synergy) प्रमाणीकर्तव्या।",
        "missing_info": [
            "शास्त्रीय-आयुर्वेद-ग्रन्थस्य सटीक-अध्याय-श्लोक-सन्दर्भः",
            "सहक्रियाशीलतां प्रमाणीकर्तुं प्रयोगात्मकं विवरणम्"
        ],
        "next_actions": [
            "Drugs & Cosmetics Act इत्यस्य Schedule 1 ग्रन्थानां विवरणं सत्यापयतु",
            "भारतीय-जैविक-संसाधनानां कृते NBA Form III अनुମೋದନং ಪರಿಶೀಲಯತು"
        ]
    },
    "hi": {
        "disclaimer": "अनुवादित व्याख्या केवल सुविधा हेतु है। अधिकृत कानूनी पाठ हेतु संदर्भित आधिकारिक स्रोत देखें।",
        "answer": "{case_title} ({ing_summary}) के संदर्भ में, वैधानिक विश्लेषण स्पष्ट करता है कि {source_title} के प्रावधान लागू होते हैं।",
        "why": "प्राथमिक साक्ष्य {authority} द्वारा जारी वैधानिक पाठ पर आधारित है।",
        "practical_meaning": "पारंपरिक जड़ी-बूटियों का केवल मिश्रण Section 3(p) के तहत पेटेंट के लिए पात्र नहीं है; अप्रत्याशित सहक्रियाशीलता (Synergy) सिद्ध करनी होगी।",
        "missing_info": [
            "सटीक शास्त्रीय ग्रंथ का अध्याय एवं श्लोक संदर्भ",
            "निष्कर्षण प्रक्रिया का प्रयोगात्मक डेटा (यदि पेटेंट संरक्षण अभीष्ट हो)"
        ],
        "next_actions": [
            "शास्त्रीय ग्रंथ (Schedule 1) का विवरण जांचें",
            "जैव विविधता अधिनियम की धारा 6 के तहत NBA Form III अनुमोदन की आवश्यकता की समीक्षा करें"
        ]
    },
    "en": {
        "disclaimer": "Decision-support intelligence only. Refer to cited official sources for authoritative statutory text.",
        "answer": "For {case_title} ({ing_summary}), statutory analysis indicates that {source_title} governs the applicable decision pathway.",
        "why": "Directly grounded in statutory provisions administered by {authority}.",
        "practical_meaning": "Traditional botanical remedies require proof of non-obvious synergistic efficacy to overcome statutory bars under Section 3(p) and Section 3(e).",
        "missing_info": [
            "Exact classical treatise chapter/verse citation",
            "Comparative experimental data establishing synergistic interaction (if patentability is pursued)"
        ],
        "next_actions": [
            "Document pharmacological synergy indices or novel extraction parameters",
            "Verify mandatory NBA Form III approval before filing patent claims involving Indian biological resources"
        ]
    }
}


def build_localized_response(
    language: str,
    case_title: str,
    ing_summary: str,
    source_title: str,
    authority: str
) -> Dict[str, Any]:
    """
    Builds a localized decision-support response while preserving
    canonical statutory identifiers and legal disclaimers.
    Falls back to English if requested language is not directly templated.
    """
    lang_key = language if language in LOCALIZED_TEMPLATES else "en"
    template = LOCALIZED_TEMPLATES[lang_key]

    return {
        "answer": template["answer"].format(
            case_title=case_title,
            ing_summary=ing_summary,
            source_title=source_title,
            authority=authority
        ),
        "why": template["why"].format(authority=authority),
        "practical_meaning": template["practical_meaning"],
        "missing_information": template["missing_info"],
        "next_actions": template["next_actions"],
        "disclaimer": template["disclaimer"],
        "is_rtl": lang_key in RTL_LANGUAGES,
        "language": language,
        "canonical_language": "en"
    }
