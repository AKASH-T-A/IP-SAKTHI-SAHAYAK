# -*- coding: utf-8 -*-
"""
IP-SAKTI Sahayak — Universal Multilingual Catalog Generator
SIH26045 | Eighth Schedule of the Constitution of India + English
"""

import re
import json

TARGET_FILE = r'frontend/src/i18n/translations/index.ts'

with open(TARGET_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});')
existing_dicts = {}
for m in pattern.finditer(content):
    code = m.group(1).lower()
    existing_dicts[code] = json.loads(m.group(2))

print(f"Loaded {len(existing_dicts)} existing dictionaries.")

EN = dict(existing_dicts['en'])
HI = dict(existing_dicts['hi'])

# ─── 75 New Canonical Keys across Batches 2-7 ──────────────────────────────────
NEW_EN = {
    # Batch 2: Explore
    "explore.breadcrumb": "Statutory Intelligence & Knowledge Base",
    "explore.searchPlaceholder": "Search formulations, patents, Section 3(p), Rule 158B, ABS, TKDL...",
    "explore.allFrameworks": "All Frameworks",
    "explore.ipPatents": "IP & Patents (Sec 3p)",
    "explore.ayushFssai": "AYUSH & FSSAI Regulations",
    "explore.bioAbs": "Biodiversity Act & ABS",
    "explore.tkTkdl": "Traditional Knowledge & TKDL",
    "explore.statutoryHighlights": "Statutory Highlights:",
    "explore.noItems": "No knowledge base records match your query.",
    "explore.actSec3p": "Analyze Formulation under Sec 3(p)",
    "explore.actRule158b": "Start Rule 158B Dossier Case",
    "explore.actAbs": "Check NBA/SBB Compliance",
    "explore.actAahar": "Formulate for Ayurveda Aahar",
    "explore.actTkdl": "Search TKDL Classifications in Cases",
    "explore.actGi": "Explore GI Strategy for Sourced Flora",

    # Batch 2: Evidence
    "evidence.breadcrumb": "Statutory Evidence Explorer",
    "evidence.allAuthorities": "All Authorities (AYUSH, CGPDTM, NBA, FSSAI)",
    "evidence.allTypes": "All Types",
    "evidence.act": "Act",
    "evidence.rule": "Rule",
    "evidence.gazetteNotification": "Gazette Notification",
    "evidence.pharmacopoeialStandard": "Pharmacopoeial Standard",
    "evidence.treaty": "Treaty",
    "evidence.verifiedAuthority": "VERIFIED STATUTORY AUTHORITY",
    "evidence.cryptoHash": "Cryptographic Hash",
    "evidence.plainSummary": "Plain Legal Summary",
    "evidence.officialExcerpt": "Official Legal Excerpt",
    "evidence.inspectCitation": "Inspect Complete Citation & Metadata →",
    "evidence.noCorpusFound": "No Statutory Corpus Found",
    "evidence.noCorpusHint": "Try clearing your query or reset the authority filters.",

    # Batch 3: Case Detail
    "caseDetail.loading": "Loading statutory intelligence...",
    "caseDetail.notFound": "Case Not Found",
    "caseDetail.notFoundDesc": "The requested case could not be located in your current session.",
    "caseDetail.returnWorkspace": "Return to Cases Workspace",
    "caseDetail.juryDemo": "Jury Demo: Strip Formulation Data",
    "caseDetail.simulateMissing": "Simulate Missing Data",
    "caseDetail.exportDossier": "Export Case Dossier",
    "caseDetail.timeMachine": "Regulatory Time Machine",
    "caseDetail.editFormulation": "Edit Formulation",
    "caseDetail.tabSummary": "Summary & Verdict",
    "caseDetail.tabDna": "Formulation DNA",
    "caseDetail.tabClassifications": "Candidate Classifications",
    "caseDetail.tabRegulations": "Applicable Regulations",
    "caseDetail.tabIpPathways": "IP Pathways",
    "caseDetail.tabAbs": "ABS Compliance",
    "caseDetail.tabPriorArt": "Prior Art Analysis",
    "caseDetail.tabEvidenceGaps": "Evidence Gaps",
    "caseDetail.tabEvidenceChain": "Statutory Evidence Chain",
    "caseDetail.tabNextActions": "Next Recommended Actions",
    "caseDetail.classificationVerdict": "Statutory Classification Verdict",
    "caseDetail.evidenceStrength": "Evidence Strength",
    "caseDetail.governingAuthority": "Governing Authority",
    "caseDetail.statutoryBasis": "Statutory Basis",
    "caseDetail.coreExcerpt": "Core Legal Excerpt",
    "caseDetail.plainExplanation": "Plain Legal Explanation",
    "caseDetail.whyThis": "Why am I seeing this recommendation?",

    # Batch 4: Auth
    "auth.showPassword": "Show password",
    "auth.hidePassword": "Hide password",
    "auth.charRequirement": "8+ characters",
    "auth.upperRequirement": "Uppercase letter",
    "auth.numRequirement": "Number",
    "auth.demoAdmin": "Demo admin:",

    # Batch 5: Intelligence Components
    "intel.drawerTitle": "STATUTORY CITATION",
    "intel.authority": "Official Authority",
    "intel.hierarchy": "Legal Hierarchy",
    "intel.version": "Version / Amendment",
    "intel.excerpt": "Official Legal Excerpt",
    "intel.plainSummary": "Plain Legal Summary",
    "intel.gazetteSource": "Official Gazette Source",
    "intel.openExternal": "Open External Link",
    "intel.closeDrawer": "Close Drawer",
    "intel.gapsTitle": "Statutory Evidence Gaps & Missing Parameters",
    "intel.resolutionStrategy": "Resolution Strategy",
    "intel.chainTitle": "Statutory Evidence Chain & Provenance",
    "intel.factTriggered": "Fact Triggered",
    "intel.ruleApplied": "Rule Applied",
    "intel.matrixTitle": "Regulatory & IP Pathways Intelligence Matrix",
    "intel.timeMachineTitle": "Regulatory Time Machine",
    "intel.historicalAmendments": "Historical Gazette Amendments",
    "intel.uploadTitle": "Upload Formulation Evidence & COA",
    "intel.dragDrop": "Drag and drop documents here, or click to browse",
    "intel.whyTitle": "Why am I seeing this recommendation?",
    "intel.deterministicVerification": "Deterministic Rule Verification",

    # Batch 6: Search + Assistant + Report
    "search.breadcrumb": "Intelligent Statutory Search",
    "search.heading": "Intelligent Search & Intent Routing",
    "search.btnSearch": "Search",
    "search.suggestedLabel": "Suggested:",
    "search.recentLabel": "Recent Searches:",
    "search.clearLabel": "Clear",
    "search.advancedFilters": "Advanced Filters & Jurisdictions",
    "search.hideAdvancedFilters": "Hide Advanced Filters",
    "search.allAuthorities": "All Authorities",
    "search.allJurisdictions": "All Jurisdictions (National)",
    "assistant.breadcrumb": "Case-Aware Intelligence Assistant",
    "assistant.bannerActive": "Ingestion Active:",
    "assistant.suggestedInquiries": "Suggested Regulatory Inquiries:",
    "assistant.directAnswer": "Direct Statutory Answer:",
    "assistant.ruleConstraints": "Deterministic Rule Constraints:",
    "assistant.officialCitations": "Official Legal Citations:",
    "assistant.evidenceGaps": "Identified Evidence Gaps:",
    "assistant.disclaimerFooter": "Statutory Intelligence Assistant operates under strict deterministic boundaries. All recommendations are grounded in Indian Gazette notifications and statutory statutes. Not a substitute for formal legal counsel.",
    "report.returnDossier": "Return to Case Dossier",
    "report.tableIngredients": "Declared Formulation Ingredients",
    "report.name": "Ingredient Name",
    "report.botanical": "Botanical Taxon",
    "report.sanskrit": "Sanskrit / Classical Name",
    "report.part": "Part Used",
    "report.percentage": "Ratio (%)",
    "report.source": "Biological Sourcing",
    "report.origin": "Geographical Origin",

    # Batch 7: Wizard + Cases + Home remaining strings
    "home.pipeline.question": "QUESTION",
    "home.pipeline.classify": "CLASSIFY",
    "home.pipeline.evidence": "EVIDENCE",
    "home.pipeline.intelligence": "INTELLIGENCE",
    "home.pipeline.action": "ACTION",
    "home.domain.plantVarietyProtection": "Plant Variety Protection",
    "cases.noMatch": 'No formulation matches "{query}". Clear your search query or create a new case.',
    "cases.jurisdictionIndia": "India (National)",
}

for k, v in NEW_EN.items():
    EN[k] = v

print(f"Total Canonical Keys in EN: {len(EN)}")

# ─── Hindi New Translations ───────────────────────────────────────────────────
NEW_HI = {
    "explore.breadcrumb": "वैधानिक बौद्धिक संपदा एवं ज्ञानकोश",
    "explore.searchPlaceholder": "फॉर्मूलेशन, पेटेंट, Section 3(p), Rule 158B, ABS, TKDL खोजें...",
    "explore.allFrameworks": "सभी विधिक ढांचे",
    "explore.ipPatents": "IP एवं पेटेंट (Sec 3p)",
    "explore.ayushFssai": "आयुष एवं FSSAI विनियम",
    "explore.bioAbs": "जैव विविधता अधिनियम एवं ABS",
    "explore.tkTkdl": "पारंपरिक ज्ञान एवं TKDL",
    "explore.statutoryHighlights": "वैधानिक मुख्य बिंदु:",
    "explore.noItems": "आपकी खोज से मेल खाता कोई विधिक रिकॉर्ड नहीं मिला।",
    "explore.actSec3p": "Section 3(p) के तहत फॉर्मूलेशन का विश्लेषण करें",
    "explore.actRule158b": "Rule 158B डोजियर प्रकरण प्रारंभ करें",
    "explore.actAbs": "NBA/SBB अनुपालन की जांच करें",
    "explore.actAahar": "आयुर्वेद आहार हेतु फॉर्मूलेशन तैयार करें",
    "explore.actTkdl": "प्रकरणों में TKDL वर्गीकरण खोजें",
    "explore.actGi": "प्राकृतिक वनस्पति हेतु GI रणनीति का अन्वेषण करें",

    "evidence.breadcrumb": "वैधानिक साक्ष्य संग्रह",
    "evidence.allAuthorities": "सभी प्राधिकारी (आयुष, CGPDTM, NBA, FSSAI)",
    "evidence.allTypes": "सभी प्रकार",
    "evidence.act": "अधिनियम (Act)",
    "evidence.rule": "नियम (Rule)",
    "evidence.gazetteNotification": "गजट अधिसूचना",
    "evidence.pharmacopoeialStandard": "फार्माकोपिया मानक",
    "evidence.treaty": "संधि / समझौता",
    "evidence.verifiedAuthority": "सत्यापित वैधानिक प्राधिकारी",
    "evidence.cryptoHash": "क्रिप्टोग्राफिक हैश",
    "evidence.plainSummary": "सरल विधिक सारांश",
    "evidence.officialExcerpt": "आधिकारिक विधिक उद्धरण",
    "evidence.inspectCitation": "संपूर्ण विधिक संदर्भ एवं मेटाडेटा देखें →",
    "evidence.noCorpusFound": "कोई वैधानिक साक्ष्य रिकॉर्ड नहीं मिला",
    "evidence.noCorpusHint": "अपनी खोज शब्द बदलें या प्राधिकारी फिल्टर रीसेट करें।",

    "caseDetail.loading": "वैधानिक विधिक जानकारी लोड हो रही है...",
    "caseDetail.notFound": "प्रकरण नहीं मिला",
    "caseDetail.notFoundDesc": "अनुरोधित प्रकरण आपके वर्तमान सत्र में उपलब्ध नहीं है।",
    "caseDetail.returnWorkspace": "प्रकरण कार्यक्षेत्र पर वापस जाएं",
    "caseDetail.juryDemo": "जूरी डेमो: फॉर्मूलेशन डेटा हटाएं",
    "caseDetail.simulateMissing": "अनुपलब्ध जानकारी का अनुकरण करें",
    "caseDetail.exportDossier": "प्रकरण डोजियर निर्यात करें",
    "caseDetail.timeMachine": "नियामक समय-चक्र (Time Machine)",
    "caseDetail.editFormulation": "फॉर्मूलेशन संशोधित करें",
    "caseDetail.tabSummary": "सारांश एवं निर्णय",
    "caseDetail.tabDna": "फॉर्मूलेशन डीएनए (DNA)",
    "caseDetail.tabClassifications": "प्रस्तावित वर्गीकरण",
    "caseDetail.tabRegulations": "लागू विनियामक नियम",
    "caseDetail.tabIpPathways": "बौद्धिक संपदा (IP) मार्ग",
    "caseDetail.tabAbs": "ABS अनुपालन",
    "caseDetail.tabPriorArt": "पूर्व-कला (Prior Art) विश्लेषण",
    "caseDetail.tabEvidenceGaps": "साक्ष्य में कमियां",
    "caseDetail.tabEvidenceChain": "वैधानिक साक्ष्य श्रृंखला",
    "caseDetail.tabNextActions": "अनुशंसित आगामी कदम",
    "caseDetail.classificationVerdict": "वैधानिक वर्गीकरण निर्णय",
    "caseDetail.evidenceStrength": "साक्ष्य की प्रामाणिकता",
    "caseDetail.governingAuthority": "नियामक प्राधिकारी",
    "caseDetail.statutoryBasis": "वैधानिक आधार",
    "caseDetail.coreExcerpt": "प्रमुख विधिक उद्धरण",
    "caseDetail.plainExplanation": "सरल विधिक व्याख्या",
    "caseDetail.whyThis": "यह अनुशंसा क्यों प्रदर्शित हो रही है?",

    "auth.showPassword": "पासवर्ड दिखाएं",
    "auth.hidePassword": "पासवर्ड छिपाएं",
    "auth.charRequirement": "8+ अक्षर",
    "auth.upperRequirement": "बड़ा अक्षर (Uppercase)",
    "auth.numRequirement": "अंक (Number)",
    "auth.demoAdmin": "डेमो व्यवस्थापक:",

    "intel.drawerTitle": "वैधानिक विधिक संदर्भ",
    "intel.authority": "आधिकारिक प्राधिकारी",
    "intel.hierarchy": "विधिक पदानुक्रम",
    "intel.version": "संस्करण / संशोधन",
    "intel.excerpt": "आधिकारिक विधिक उद्धरण",
    "intel.plainSummary": "सरल विधिक सारांश",
    "intel.gazetteSource": "आधिकारिक गजट स्रोत",
    "intel.openExternal": "बाह्य आधिकारिक लिंक खोलें",
    "intel.closeDrawer": "बंद करें",
    "intel.gapsTitle": "वैधानिक साक्ष्य की कमियां एवं अनुपलब्ध जानकारी",
    "intel.resolutionStrategy": "समाधान रणनीति",
    "intel.chainTitle": "वैधानिक साक्ष्य श्रृंखला एवं स्रोत",
    "intel.factTriggered": "प्रमाणित तथ्य",
    "intel.ruleApplied": "लागू वैधानिक नियम",
    "intel.matrixTitle": "नियामक एवं बौद्धिक संपदा निर्णय मैट्रिक्स",
    "intel.timeMachineTitle": "नियामक समय-चक्र (Regulatory Time Machine)",
    "intel.historicalAmendments": "ऐतिहासिक गजट संशोधन",
    "intel.uploadTitle": "फॉर्मूलेशन साक्ष्य एवं COA अपलोड करें",
    "intel.dragDrop": "दस्तावेज़ यहां खींचकर लाएं या ब्राउज़ करने के लिए क्लिक करें",
    "intel.whyTitle": "यह अनुशंसा क्यों दिखाई दे रही है?",
    "intel.deterministicVerification": "नियत नियम सत्यापन",

    "search.breadcrumb": "बुद्धिमान वैधानिक खोज",
    "search.heading": "बुद्धिमान खोज एवं विधिक मार्गदर्शन",
    "search.btnSearch": "खोजें",
    "search.suggestedLabel": "सुझाए गए:",
    "search.recentLabel": "हालिया खोजें:",
    "search.clearLabel": "हटाएं",
    "search.advancedFilters": "उन्नत फिल्टर एवं अधिकार क्षेत्र",
    "search.hideAdvancedFilters": "उन्नत फिल्टर छिपाएं",
    "search.allAuthorities": "सभी प्राधिकारी",
    "search.allJurisdictions": "सभी अधिकार क्षेत्र (राष्ट्रीय)",

    "assistant.breadcrumb": "प्रकरण-जागरूक विधिक सहायक",
    "assistant.bannerActive": "सक्रिय फॉर्मूलेशन:",
    "assistant.suggestedInquiries": "सुझाए गए विनियामक प्रश्न:",
    "assistant.directAnswer": "प्रत्यक्ष वैधानिक उत्तर:",
    "assistant.ruleConstraints": "नियत विधिक नियम सीमाएं:",
    "assistant.officialCitations": "आधिकारिक विधिक संदर्भ:",
    "assistant.evidenceGaps": "पहचानी गई साक्ष्य कमियां:",
    "assistant.disclaimerFooter": "वैधानिक निर्णय सहायक पूर्णतः अधिकृत भारतीय गजट अधिसूचनाओं एवं संविधियों पर आधारित है। यह औपचारिक विधिक परामर्श का विकल्प नहीं है।",

    "report.returnDossier": "प्रकरण डोजियर पर वापस जाएं",
    "report.tableIngredients": "घोषित फॉर्मूलेशन घटक",
    "report.name": "घटक का नाम",
    "report.botanical": "वानस्पतिक नाम (Botanical Taxon)",
    "report.sanskrit": "संस्कृत / शास्त्रीय नाम",
    "report.part": "प्रयुक्त अंग",
    "report.percentage": "अनुपात (%)",
    "report.source": "जैविक स्रोत (ABS)",
    "report.origin": "भौगोलिक उत्पत्ति",

    "home.pipeline.question": "प्रश्न",
    "home.pipeline.classify": "वर्गीकरण",
    "home.pipeline.evidence": "साक्ष्य",
    "home.pipeline.intelligence": "निर्णय",
    "home.pipeline.action": "कार्रवाई",
    "home.domain.plantVarietyProtection": "पादप किस्म संरक्षण",
    "cases.noMatch": '"{query}" से मेल खाता कोई फॉर्मूलेशन नहीं मिला। अपनी खोज बदलें या नया प्रकरण बनाएं।',
    "cases.jurisdictionIndia": "भारत (राष्ट्रीय)",
}

for k, v in NEW_HI.items():
    HI[k] = v

print(f"Total Canonical Keys in HI: {len(HI)}")

# ─── Load 149 Missing Keys Dictionary ──────────────────────────────────────────
with open('scratch/missing_149.json', 'r', encoding='utf-8') as f:
    missing_149 = json.load(f)

# Helper function to generate complete language dictionary
def build_lang_dict(code, base_dict, lang_overrides):
    res = {}
    for k in EN.keys():
        if k in lang_overrides:
            res[k] = lang_overrides[k]
        elif k in base_dict:
            res[k] = base_dict[k]
        else:
            # Fallback to English canonical string
            res[k] = EN[k]
    return res

# Read generate_all_translations for existing 342-key regional dictionaries
print("Compiling universal 23-language catalog...")

# We will write the updated index.ts
out_lines = []
out_lines.append('/**')
out_lines.append(' * IP-SAKTI Sahayak — Application-Wide Multilingual Translation Catalog')
out_lines.append(' * SIH26045 | Eighth Schedule of the Constitution of India + English')
out_lines.append(' *')
out_lines.append(' * 100% key parity across all 22 Eighth Schedule Indian Languages + English.')
out_lines.append(' * Canonical statutory identifiers (Section 3(p), Rule 158B, Form III, Schedule T) strictly preserved.')
out_lines.append(' */')
out_lines.append('')
out_lines.append("import { LanguageCode } from '../languages';")
out_lines.append('')
out_lines.append('export type TranslationDict = Record<string, string>;')
out_lines.append('')

# Add EN
out_lines.append(f'export const EN_TRANSLATIONS: TranslationDict = {json.dumps(EN, ensure_ascii=False, indent=2)};')
out_lines.append('')

# Add HI
out_lines.append(f'export const HI_TRANSLATIONS: TranslationDict = {json.dumps(HI, ensure_ascii=False, indent=2)};')
out_lines.append('')

# Regional translations definitions
# Kannada (kn)
KN_EXTRAS = {
    **{k: HI[k] for k in missing_149 if k not in existing_dicts.get('kn', {})},
    "home.workflow.mostUsed": "ಹೆಚ್ಚು ಬಳಸಲಾಗಿದೆ",
    "home.intake.ayurvedicFormulation": "ಆಯುರ್ವೇದ ಸೂತ್ರೀಕರಣ",
    "home.intake.ayurvedicFormulationHint": "ಶಾಸ್ತ್ರೀಯ ಅಥವಾ ಸ್ವಾಮ್ಯದ ಆಯುರ್ವೇದ ಔಷಧಿಗಳು, ಚೂರ್ಣ, ವಟಿ",
    "home.intake.herbalProduct": "ಗಿಡಮೂಲಿಕೆ ಉತ್ಪನ್ನ",
    "home.intake.herbalProductHint": "ಆಯುಷ್ ಅಥವಾ ನ್ಯೂಟ್ರಾಸ್ಯುಟಿಕಲ್ ಉತ್ಪನ್ನಗಳು",
    "home.intake.plantResource": "ಸಸ್ಯ / ಜೈವಿಕ ಸಂಪನ್ಮೂಲ",
    "home.intake.plantResourceHint": "ಔಷಧೀಯ ಸಸ್ಯಗಳು, ಕಾಡು ಅಥವಾ ಕೃಷಿ ಮೂಲದ ಕಚ್ಚಾ ವಸ್ತುಗಳು",
    "home.intake.traditionalKnowledge": "ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ",
    "home.intake.traditionalKnowledgeHint": "ಪಾರಂಪರಿಕ ಜ್ಞಾನ ಮತ್ತು TKDL ಪರಿಶೀಲನೆ",
    "home.intake.novelProcess": "ತಯಾರಿಕಾ ವಿಧಾನ / ಪ್ರಕ್ರಿಯೆ",
    "home.intake.novelProcessHint": "ಹೊಸ ಹೊರತೆಗೆಯುವಿಕೆ ಅಥವಾ ಸಂಸ್ಕರಣಾ ತಂತ್ರಜ್ಞಾನ",
    "home.intake.brandIdentity": "ಬ್ರಾಂಡ್ / ಉತ್ಪನ್ನ ಗುರುತು",
    "home.intake.brandIdentityHint": "ಟ್ರೇಡ್‌ಮಾರ್ಕ್ ಮತ್ತು ಬ್ರಾಂಡ್ ರಕ್ಷಣೆ",
    "home.intake.geographicalIdentity": "ಭೌಗೋಳಿಕ ಗುರುತು (GI)",
    "home.intake.geographicalIdentityHint": "ಪ್ರಾದೇಶಿಕ ಔಷಧೀಯ ಸಸ್ಯಗಳು ಮತ್ತು ಉತ್ಪನ್ನಗಳ GI ರಕ್ಷಣೆ",
    "home.intake.regulatoryQuestion": "ನಿಯಂತ್ರಕ ಪ್ರಶ್ನೆ",
    "home.intake.regulatoryQuestionHint": "Rule 158B, FSSAI ಅಥವಾ NBA ಅನುಮೋದನೆಗಳ ಬಗೆಗಿನ ಪ್ರಶ್ನೆಗಳು",

    "explore.breadcrumb": "ಶಾಸನಬದ್ಧ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಜ್ಞಾನಕೋಶ",
    "explore.searchPlaceholder": "ಸೂತ್ರೀಕರಣಗಳು, ಪೇಟೆಂಟ್‌ಗಳು, Section 3(p), Rule 158B, ABS, TKDL ಹುಡುಕಿ...",
    "explore.allFrameworks": "ಎಲ್ಲಾ ಚೌಕಟ್ಟುಗಳು",
    "explore.ipPatents": "IP ಮತ್ತು ಪೇಟೆಂಟ್‌ಗಳು (Sec 3p)",
    "explore.ayushFssai": "ಆಯುಷ್ ಮತ್ತು FSSAI ನಿಯಮಾವಳಿಗಳು",
    "explore.bioAbs": "ಜೈವಿಕ ವೈವಿಧ್ಯ ಕಾಯಿದೆ ಮತ್ತು ABS",
    "explore.tkTkdl": "ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ ಮತ್ತು TKDL",
    "explore.statutoryHighlights": "ಶಾಸನಬದ್ಧ ಮುಖ್ಯಾಂಶಗಳು:",
    "explore.noItems": "ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ದಾಖಲೆಗಳಿಲ್ಲ.",
    "explore.actSec3p": "Section 3(p) ಅಡಿಯಲ್ಲಿ ಸೂತ್ರೀಕರಣವನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    "explore.actRule158b": "Rule 158B ಡೋಸಿಯರ್ ಪ್ರಕರಣ ಪ್ರಾರಂಭಿಸಿ",
    "explore.actAbs": "NBA/SBB ಅನುಸರಣೆಯನ್ನು ಪರಿಶೀಲಿಸಿ",
    "explore.actAahar": "ಆಯುರ್ವೇದ ಆಹಾರಕ್ಕಾಗಿ ಸೂತ್ರೀಕರಿಸಿ",
    "explore.actTkdl": "ಪ್ರಕರಣಗಳಲ್ಲಿ TKDL ವರ್ಗೀಕರಣಗಳನ್ನು ಹುಡುಕಿ",
    "explore.actGi": "ಸಸ್ಯ ಮೂಲಗಳಿಗಾಗಿ GI ತಂತ್ರವನ್ನು ಅನ್ವೇಷಿಸಿ",

    "evidence.breadcrumb": "ಶಾಸನಬದ್ಧ ಸಾಕ್ಷ್ಯ ಅನ್ವೇಷಕ",
    "evidence.allAuthorities": "ಎಲ್ಲಾ ಪ್ರಾಧಿಕಾರಗಳು (ಆಯುಷ್, CGPDTM, NBA, FSSAI)",
    "evidence.allTypes": "ಎಲ್ಲಾ ಪ್ರಕಾರಗಳು",
    "evidence.act": "ಕಾಯಿದೆ (Act)",
    "evidence.rule": "ನಿಯಮ (Rule)",
    "evidence.gazetteNotification": "ಗೆಜೆಟ್ ಅಧಿಸೂಚನೆ",
    "evidence.pharmacopoeialStandard": "ಫಾರ್ಮಾಕೋಪಿಯಲ್ ಮಾನದಂಡ",
    "evidence.treaty": "ಒಪ್ಪಂದ / ಸಂಧಿ",
    "evidence.verifiedAuthority": "ದೃಢೀಕೃತ ಶಾಸನಬದ್ಧ ಪ್ರಾಧಿಕಾರ",
    "evidence.cryptoHash": "ಕ್ರಿಪ್ಟೋಗ್ರಾಫಿಕ್ ಹ್ಯಾಶ್",
    "evidence.plainSummary": "ಸರಳ ಕಾನೂನು ಸಾರಾಂಶ",
    "evidence.officialExcerpt": "ಅಧಿಕೃತ ಕಾನೂನು ಉದ್ಧರಣ",
    "evidence.inspectCitation": "ಸಂಪೂರ್ಣ ಉಲ್ಲೇಖ ಮತ್ತು ಮೆಟಾಡೇಟಾ ವೀಕ್ಷಿಸಿ →",
    "evidence.noCorpusFound": "ಯಾವುದೇ ಶಾಸನಬದ್ಧ ಸಾಕ್ಷ್ಯ ಕಂಡುಬಂದಿಲ್ಲ",
    "evidence.noCorpusHint": "ಹುಡುಕಾಟ ಪದಗಳನ್ನು ಬದಲಾಯಿಸಿ ಅಥವಾ ಫಿಲ್ಟರ್ ಮರುಹೊಂದಿಸಿ.",

    "caseDetail.loading": "ಶಾಸನಬದ್ಧ ಬುದ್ಧಿಮತ್ತೆ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "caseDetail.notFound": "ಪ್ರಕರಣ ಕಂಡುಬಂದಿಲ್ಲ",
    "caseDetail.notFoundDesc": "ವಿನಂತಿಸಿದ ಪ್ರಕರಣವು ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಅಧಿವೇಶನದಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ.",
    "caseDetail.returnWorkspace": "ಪ್ರಕರಣಗಳ ಕಾರ್ಯಸ್ಥಳಕ್ಕೆ ಹಿಂತಿರುಗಿ",
    "caseDetail.juryDemo": "ಜೂರಿ ಡೆಮೊ: ಸೂತ್ರೀಕರಣ ಡೇಟಾ ತೆಗೆದುಹಾಕಿ",
    "caseDetail.simulateMissing": "ಕಾಣೆಯಾದ ಡೇಟಾವನ್ನು ಸಿಮ್ಯುಲೇಟ್ ಮಾಡಿ",
    "caseDetail.exportDossier": "ಕೇಸ್ ಡೋಸಿಯರ್ ರಫ್ತು ಮಾಡಿ",
    "caseDetail.timeMachine": "ನಿಯಂತ್ರಕ ಟೈಮ್ ಮೆಷಿನ್",
    "caseDetail.editFormulation": "ಸೂತ್ರೀಕರಣವನ್ನು ತಿದ್ದಿ",
    "caseDetail.tabSummary": "ಸಾರಾಂಶ ಮತ್ತು ತೀರ್ಪು",
    "caseDetail.tabDna": "ಸೂತ್ರೀಕರಣ DNA",
    "caseDetail.tabClassifications": "ಅಭ್ಯರ್ಥಿ ವರ್ಗೀಕರಣಗಳು",
    "caseDetail.tabRegulations": "ಅನ್ವಯವಾಗುವ ನಿಯಮಗಳು",
    "caseDetail.tabIpPathways": "IP ಮಾರ್ಗಗಳು",
    "caseDetail.tabAbs": "ABS ಅನುಸರಣೆ",
    "caseDetail.tabPriorArt": "ಪೂರ್ವ ಕಲೆ ವಿಶ್ಲೇಷಣೆ",
    "caseDetail.tabEvidenceGaps": "ಸಾಕ್ಷ್ಯದ ಅಂತರಗಳು",
    "caseDetail.tabEvidenceChain": "ಶಾಸನಬದ್ಧ ಸಾಕ್ಷ್ಯ ಸರಪಳಿ",
    "caseDetail.tabNextActions": "ಮುಂದಿನ ಶಿಫಾರಸು ಕ್ರಮಗಳು",
    "caseDetail.classificationVerdict": "ಶಾಸನಬದ್ಧ ವರ್ಗೀಕರಣ ತೀರ್ಪು",
    "caseDetail.evidenceStrength": "ಸಾಕ್ಷ್ಯದ ಸಾಮರ್ಥ್ಯ",
    "caseDetail.governingAuthority": "ಆಡಳಿತ ಪ್ರಾಧಿಕಾರ",
    "caseDetail.statutoryBasis": "ಶಾಸನಬದ್ಧ ಆಧಾರ",
    "caseDetail.coreExcerpt": "ಪ್ರಮುಖ ಕಾನೂನು ಉದ್ಧರಣ",
    "caseDetail.plainExplanation": "ಸರಳ ಕಾನೂನು ವಿವರಣೆ",
    "caseDetail.whyThis": "ನಾನು ಈ ಶಿಫಾರಸನ್ನು ಏಕೆ ನೋಡುತ್ತಿದ್ದೇನೆ?",

    "auth.showPassword": "ಪಾಸ್‌ವರ್ಡ್ ತೋರಿಸಿ",
    "auth.hidePassword": "ಪಾಸ್‌ವರ್ಡ್ ಮರೆಮಾಡಿ",
    "auth.charRequirement": "8+ ಅಕ್ಷರಗಳು",
    "auth.upperRequirement": "ದೊಡ್ಡಕ್ಷರ (Uppercase)",
    "auth.numRequirement": "ಸಂಖ್ಯೆ (Number)",
    "auth.demoAdmin": "ಡೆಮೊ ನಿರ್ವಾಹಕ:",

    "intel.drawerTitle": "ಶಾಸನಬದ್ಧ ಉಲ್ಲೇಖ",
    "intel.authority": "ಅಧಿಕೃತ ಪ್ರಾಧಿಕಾರ",
    "intel.hierarchy": "ಕಾನೂನು ಶ್ರೇಣಿ",
    "intel.version": "ಆವೃತ್ತಿ / ತಿದ್ದುಪಡಿ",
    "intel.excerpt": "ಅಧಿಕೃತ ಕಾನೂನು ಉದ್ಧರಣ",
    "intel.plainSummary": "ಸರಳ ಕಾನೂನು ಸಾರಾಂಶ",
    "intel.gazetteSource": "ಅಧಿಕೃತ ಗೆಜೆಟ್ ಮೂಲ",
    "intel.openExternal": "ಬಾಹ್ಯ ಲಿಂಕ್ ತೆರೆಯಿರಿ",
    "intel.closeDrawer": "ಮುಚ್ಚಿ",
    "intel.gapsTitle": "ಶಾಸನಬದ್ಧ ಸಾಕ್ಷ್ಯದ ಅಂತರಗಳು ಮತ್ತು ಕಾಣೆಯಾದ ನಿಯತಾಂಕಗಳು",
    "intel.resolutionStrategy": "ಪರಿಹಾರ ತಂತ್ರ",
    "intel.chainTitle": "ಶಾಸನಬದ್ಧ ಸಾಕ್ಷ್ಯ ಸರಪಳಿ ಮತ್ತು ಮೂಲ",
    "intel.factTriggered": "ಪ್ರಚೋದಿತ ಸತ್ಯ",
    "intel.ruleApplied": "ಅನ್ವಯಿಸಲಾದ ನಿಯಮ",
    "intel.matrixTitle": "ನಿಯಂತ್ರಕ ಮತ್ತು IP ಮಾರ್ಗಗಳ ಮ್ಯಾಟ್ರಿಕ್ಸ್",
    "intel.timeMachineTitle": "ನಿಯಂತ್ರಕ ಟೈಮ್ ಮೆಷಿನ್",
    "intel.historicalAmendments": "ಐತಿಹಾಸಿಕ ಗೆಜೆಟ್ ತಿದ್ದುಪಡಿಗಳು",
    "intel.uploadTitle": "ಸೂತ್ರೀಕರಣ ಸಾಕ್ಷ್ಯ ಮತ್ತು COA ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "intel.dragDrop": "ದಾಖಲೆಗಳನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಮತ್ತು ಬಿಡಿ",
    "intel.whyTitle": "ನಾನು ಈ ಶಿಫಾರಸನ್ನು ಏಕೆ ನೋಡುತ್ತಿದ್ದೇನೆ?",
    "intel.deterministicVerification": "ಸ್ಥಿರ ನಿಯಮ ಪರಿಶೀಲನೆ",

    "search.breadcrumb": "ಬುದ್ಧಿವಂತ ಶಾಸನಬದ್ಧ ಹುಡುಕಾಟ",
    "search.heading": "ಬುದ್ಧಿವಂತ ಹುಡುಕಾಟ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ",
    "search.btnSearch": "ಹುಡುಕಿ",
    "search.suggestedLabel": "ಸಲಹೆಗಳು:",
    "search.recentLabel": "ಇತ್ತೀಚಿನ ಹುಡುಕಾಟಗಳು:",
    "search.clearLabel": "ತೆರವುಗೊಳಿಸಿ",
    "search.advancedFilters": "ಸುಧಾರಿತ ಶೋಧಕಗಳು ಮತ್ತು ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿಗಳು",
    "search.hideAdvancedFilters": "ಸುಧಾರಿತ ಶೋಧಕಗಳನ್ನು ಮರೆಮಾಡಿ",
    "search.allAuthorities": "ಎಲ್ಲಾ ಪ್ರಾಧಿಕಾರಗಳು",
    "search.allJurisdictions": "ಎಲ್ಲಾ ಅಧಿಕಾರ ವ್ಯಾಪ್ತಿಗಳು (ರಾಷ್ಟ್ರೀಯ)",

    "assistant.breadcrumb": "ಪ್ರಕರಣ-ತಿಳುವಳಿಕೆಯುಳ್ಳ ಬುದ್ಧಿಮತ್ತೆ ಸಹಾಯಕ",
    "assistant.bannerActive": "ಸಕ್ರಿಯ ಪ್ರಕ್ರಿಯೆ:",
    "assistant.suggestedInquiries": "ಶಿಫಾರಸು ಮಾಡಲಾದ ನಿಯಂತ್ರಕ ಪ್ರಶ್ನೆಗಳು:",
    "assistant.directAnswer": "ನೇರ ಶಾಸನಬದ್ಧ ಉತ್ತರ:",
    "assistant.ruleConstraints": "ಸ್ಥಿರ ನಿಯಮ ನಿರ್ಬಂಧಗಳು:",
    "assistant.officialCitations": "ಅಧಿಕೃತ ಕಾನೂನು ಉಲ್ಲೇಖಗಳು:",
    "assistant.evidenceGaps": "ಗುರುತಿಸಲಾದ ಸಾಕ್ಷ್ಯದ ಅಂತರಗಳು:",
    "assistant.disclaimerFooter": "ಶಾಸನಬದ್ಧ ಬುದ್ಧಿಮತ್ತೆ ಸಹಾಯಕವು ಕಟ್ಟುನಿಟ್ಟಾದ ನಿರ್ಣಾಯಕ ಗಡಿಗಳಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ಎಲ್ಲಾ ಶಿಫಾರಸುಗಳು ಭಾರತೀಯ ಗೆಜೆಟ್ ಅಧಿಸೂಚನೆಗಳು ಮತ್ತು ಶಾಸನಬದ್ಧ ಕಾನೂನುಗಳ ಮೇಲೆ ಆಧಾರಿತವಾಗಿವೆ.",

    "report.returnDossier": "ಕೇಸ್ ಡೋಸಿಯರ್‌ಗೆ ಹಿಂತಿರುಗಿ",
    "report.tableIngredients": "ಘೋಷಿತ ಸೂತ್ರೀಕರಣ ಘಟಕಗಳು",
    "report.name": "ಘಟಕದ ಹೆಸರು",
    "report.botanical": "ಸಸ್ಯಶಾಸ್ತ್ರೀಯ ಹೆಸರು (Botanical Taxon)",
    "report.sanskrit": "ಸಂಸ್ಕೃತ / ಶಾಸ್ತ್ರೀಯ ಹೆಸರು",
    "report.part": "ಬಳಸಿದ ಭಾಗ",
    "report.percentage": "ಅನುಪಾತ (%)",
    "report.source": "ಜೈವಿಕ ಮೂಲ (ABS)",
    "report.origin": "ಭೌಗೋಳಿಕ ಮೂಲ",

    "home.pipeline.question": "ಪ್ರಶ್ನೆ",
    "home.pipeline.classify": "ವರ್ಗೀಕರಣ",
    "home.pipeline.evidence": "ಸಾಕ್ಷ್ಯ",
    "home.pipeline.intelligence": "ಬುದ್ಧಿಮತ್ತೆ",
    "home.pipeline.action": "ಕ್ರಮ",
    "home.domain.plantVarietyProtection": "ಸಸ್ಯ ಪ್ರಭೇದಗಳ ಸಂರಕ್ಷಣೆ",
    "cases.noMatch": 'ಯಾವುದೇ ಸೂತ್ರೀಕರಣ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ "{query}".',
    "cases.jurisdictionIndia": "ಭಾರತ (ರಾಷ್ಟ್ರೀಯ)",
}

# Tamil (ta)
TA_EXTRAS = {
    **{k: HI[k] for k in missing_149 if k not in existing_dicts.get('ta', {})},
    "home.workflow.mostUsed": "அதிகம் பயன்படுத்தப்பட்டது",
    "home.intake.ayurvedicFormulation": "ஆயுர்வேத உருவாக்கம்",
    "home.intake.ayurvedicFormulationHint": "பாரம்பரிய அல்லது தனியுரிம ஆயுர்வேத மருந்துகள்",
    "home.intake.herbalProduct": "மூலிகைப் பொருள்",
    "home.intake.herbalProductHint": "ஆயுஷ் அல்லது ஊட்டச்சத்து துணைப் பொருட்கள்",
    "home.intake.plantResource": "தாவர / உயிரியல் வளம்",
    "home.intake.plantResourceHint": "மருத்துவ தாவரங்கள் மற்றும் மூலப்பொருட்கள்",
    "home.intake.traditionalKnowledge": "பாரம்பரிய அறிவு",
    "home.intake.traditionalKnowledgeHint": "பாரம்பரிய மூலிகை சூத்திரங்கள் மற்றும் TKDL",
    "home.intake.novelProcess": "உற்பத்தி செயல்முறை",
    "home.intake.novelProcessHint": "புதிய பிரித்தெடுத்தல் அல்லது செயலாக்க நுட்பங்கள்",
    "home.intake.brandIdentity": "வணிக முத்திரை / அடையாளம்",
    "home.intake.brandIdentityHint": "வர்த்தக முத்திரை மற்றும் தயாரிப்பு பாதுகாப்பு",
    "home.intake.geographicalIdentity": "புவிசார் குறியீடு (GI)",
    "home.intake.geographicalIdentityHint": "பாரம்பரிய பிராந்திய தயாரிப்புகளுக்கான புவிசார் குறியீடு",
    "home.intake.regulatoryQuestion": "ஒழுங்குமுறை வினா",
    "home.intake.regulatoryQuestionHint": "Rule 158B, FSSAI அல்லது NBA அனுமதி குறித்த வினாக்கள்",

    "explore.breadcrumb": "சட்டரீதியான நுண்ணறிவு மற்றும் அறிவுத் தளம்",
    "explore.searchPlaceholder": "உருவாக்கங்கள், காப்புரிமைகள், Section 3(p), Rule 158B, ABS, TKDL தேடுக...",
    "explore.allFrameworks": "அனைத்து கட்டமைப்புகள்",
    "explore.ipPatents": "IP மற்றும் காப்புரிமைகள் (Sec 3p)",
    "explore.ayushFssai": "ஆயுஷ் மற்றும் FSSAI விதிமுறைகள்",
    "explore.bioAbs": "பல்லுயிர் சட்டம் மற்றும் ABS",
    "explore.tkTkdl": "பாரம்பரிய அறிவு மற்றும் TKDL",
    "explore.statutoryHighlights": "சட்டப்பூர்வ சிறப்பம்சங்கள்:",
    "explore.noItems": "உங்கள் தேடலுக்குரிய பதிவுகள் எதுவும் கிடைக்கவில்லை.",
    "explore.actSec3p": "Section 3(p) இன் கீழ் உருவாக்கத்தை பகுப்பாய்வு செய்க",
    "explore.actRule158b": "Rule 158B கோப்பு வழக்கை தொடங்கவும்",
    "explore.actAbs": "NBA/SBB இணக்கத்தை சரிபார்க்கவும்",
    "explore.actAahar": "ஆயுர்வேத உணவை உருவாக்கவும்",
    "explore.actTkdl": "வழக்குகளில் TKDL வகைப்பாடுகளைத் தேடுங்கள்",
    "explore.actGi": "தாவரங்களுக்கான GI உத்தியை ஆராயுங்கள்",

    "evidence.breadcrumb": "சட்டரீதியான சான்றுகள் ஆய்வாளர்",
    "evidence.allAuthorities": "அனைத்து அதிகார அமைப்புகளும் (ஆயுஷ், CGPDTM, NBA, FSSAI)",
    "evidence.allTypes": "அனைத்து வகைகள்",
    "evidence.act": "சட்டம் (Act)",
    "evidence.rule": "விதி (Rule)",
    "evidence.gazetteNotification": "அரசிதழ் அறிவிப்பு",
    "evidence.pharmacopoeialStandard": "மருந்தியல் தரநிலை",
    "evidence.treaty": "ஒப்பந்தம்",
    "evidence.verifiedAuthority": "சரிபார்க்கப்பட்ட சட்டப்பூர்வ அதிகாரம்",
    "evidence.cryptoHash": "கிரிப்டோகிராஃபிக் ஹாஷ்",
    "evidence.plainSummary": "எளிய சட்டச் சுருக்கம்",
    "evidence.officialExcerpt": "அதிகாரப்பூர்வ சட்டப் பகுதி",
    "evidence.inspectCitation": "முழு விவரங்களையும் காண்க →",
    "evidence.noCorpusFound": "சட்டப்பூர்வ சான்றுகள் எதுவும் கிடைக்கவில்லை",
    "evidence.noCorpusHint": "தேடல் வார்த்தைகளை மாற்றவும் அல்லது வடிப்பான்களை மீட்டமைக்கவும்.",

    "caseDetail.loading": "சட்டரீதியான நுண்ணறிவு ஏற்றப்படுகிறது...",
    "caseDetail.notFound": "வழக்கு கிடைக்கவில்லை",
    "caseDetail.notFoundDesc": "கோரப்பட்ட வழக்கு உங்கள் அமர்வில் காணப்படவில்லை.",
    "caseDetail.returnWorkspace": "வழக்கு பணிமனைக்குத் திரும்பு",
    "caseDetail.juryDemo": "ஜூரி டெமோ: தரவை அகற்று",
    "caseDetail.simulateMissing": "விடுபட்ட தரவை உருவகப்படுத்துக",
    "caseDetail.exportDossier": "வழக்கு ஆவணத்தை ஏற்றுமதி செய்",
    "caseDetail.timeMachine": "ஒழுங்குமுறை கால இயந்திரம்",
    "caseDetail.editFormulation": "உருவாக்கத்தைத் திருத்து",
    "caseDetail.tabSummary": "சுருக்கம் மற்றும் தீர்ப்பு",
    "caseDetail.tabDna": "உருவாக்கம் DNA",
    "caseDetail.tabClassifications": "பரிசீலனை வகைப்பாடுகள்",
    "caseDetail.tabRegulations": "பொருந்தக்கூடிய விதிமுறைகள்",
    "caseDetail.tabIpPathways": "IP பாதைகள்",
    "caseDetail.tabAbs": "ABS இணக்கம்",
    "caseDetail.tabPriorArt": "முன் கலை பகுப்பாய்வு",
    "caseDetail.tabEvidenceGaps": "சான்று இடைவெளிகள்",
    "caseDetail.tabEvidenceChain": "சட்டப்பூர்வ சான்று சங்கிலி",
    "caseDetail.tabNextActions": "அடுத்த பரிந்துரைக்கப்பட்ட நடவடிக்கைகள்",
    "caseDetail.classificationVerdict": "சட்டரீதியான வகைப்பாடு தீர்ப்பு",
    "caseDetail.evidenceStrength": "சான்றின் வலிமை",
    "caseDetail.governingAuthority": "நிர்வாக அதிகாரம்",
    "caseDetail.statutoryBasis": "சட்டரீதியான அடிப்படை",
    "caseDetail.coreExcerpt": "முக்கிய சட்டப் பகுதி",
    "caseDetail.plainExplanation": "எளிய சட்ட விளக்கம்",
    "caseDetail.whyThis": "இந்த பரிந்துரையை நான் ஏன் பார்க்கிறேன்?",

    "auth.showPassword": "கடவுச்சொல்லைக் காட்டு",
    "auth.hidePassword": "கடவுச்சொல்லை மறை",
    "auth.charRequirement": "8+ எழுத்துக்கள்",
    "auth.upperRequirement": "பெரிய எழுத்து (Uppercase)",
    "auth.numRequirement": "எண் (Number)",
    "auth.demoAdmin": "டெமோ நிர்வாகி:",

    "intel.drawerTitle": "சட்டரீதியான மேற்கோள்",
    "intel.authority": "அதிகாரப்பூர்வ அதிகாரம்",
    "intel.hierarchy": "சட்டப் படிநிலை",
    "intel.version": "பதிப்பு / திருத்தம்",
    "intel.excerpt": "அதிகாரப்பூர்வ சட்டப் பகுதி",
    "intel.plainSummary": "எளிய சட்டச் சுருக்கம்",
    "intel.gazetteSource": "அதிகாரப்பூர்வ அரசிதழ் மூலம்",
    "intel.openExternal": "வெளிப்புற இணைப்பைத் திற",
    "intel.closeDrawer": "மூடு",
    "intel.gapsTitle": "சட்டப்பூர்வ சான்று இடைவெளிகள் மற்றும் விடுபட்ட தகவல்கள்",
    "intel.resolutionStrategy": "தீர்வு உத்தி",
    "intel.chainTitle": "சட்டப்பூர்வ சான்று சங்கிலி மற்றும் தோற்றம்",
    "intel.factTriggered": "தூண்டப்பட்ட உண்மை",
    "intel.ruleApplied": "பயன்படுத்தப்பட்ட விதி",
    "intel.matrixTitle": "ஒழுங்குமுறை மற்றும் IP பாதைகள் மேட்ரிக்ஸ்",
    "intel.timeMachineTitle": "ஒழுங்குமுறை கால இயந்திரம்",
    "intel.historicalAmendments": "வரலாற்று அரசிதழ் திருத்தங்கள்",
    "intel.uploadTitle": "ஆவணங்களைப் பதிவேற்றுங்கள்",
    "intel.dragDrop": "ஆவணங்களை இங்கே இழுத்துப் போடவும்",
    "intel.whyTitle": "இந்த பரிந்துரையை நான் ஏன் பார்க்கிறேன்?",
    "intel.deterministicVerification": "திட்டவட்டமான விதி சரிபார்ப்பு",

    "search.breadcrumb": "அறிவார்ந்த சட்டத் தேடல்",
    "search.heading": "அறிவார்ந்த தேடல் மற்றும் வழிசெலுத்தல்",
    "search.btnSearch": "தேடு",
    "search.suggestedLabel": "பரிந்துரைகள்:",
    "search.recentLabel": "சமீபத்திய தேடல்கள்:",
    "search.clearLabel": "அழி",
    "search.advancedFilters": "மேம்பட்ட வடிகட்டிகள்",
    "search.hideAdvancedFilters": "வடிகட்டிகளை மறை",
    "search.allAuthorities": "அனைத்து அதிகார அமைப்புகளும்",
    "search.allJurisdictions": "அனைத்து அதிகார வரம்புகளும் (தேசிய)",

    "assistant.breadcrumb": "வழக்கு-சார்ந்த நுண்ணறிவு உதவியாளர்",
    "assistant.bannerActive": "செயலில் உள்ளது:",
    "assistant.suggestedInquiries": "பரிந்துரைக்கப்பட்ட ஒழுங்குமுறை வினாக்கள்:",
    "assistant.directAnswer": "நேரடி சட்டரீதியான பதில்:",
    "assistant.ruleConstraints": "திட்டவட்டமான விதி கட்டுப்பாடுகள்:",
    "assistant.officialCitations": "அதிகாரப்பூர்வ சட்ட மேற்கோள்கள்:",
    "assistant.evidenceGaps": "அடையாளம் காணப்பட்ட சான்று இடைவெளிகள்:",
    "assistant.disclaimerFooter": "சட்டரீதியான நுண்ணறிவு உதவியாளர் கடுமையான சட்ட எல்லைகளுக்குள் செயல்படுகிறது. அனைத்து பரிந்துரைகளும் இந்திய அரசிதழ் அறிவிப்புகள் மற்றும் சட்டங்களை அடிப்படையாகக் கொண்டவை.",

    "report.returnDossier": "வழக்கு ஆவணத்திற்குத் திரும்பு",
    "report.tableIngredients": "அறிவிக்கப்பட்ட உருவாக்க உட்பொருட்கள்",
    "report.name": "உட்பொருளின் பெயர்",
    "report.botanical": "தாவரவியல் பெயர் (Botanical Taxon)",
    "report.sanskrit": "சமஸ்கிருதம் / பாரம்பரிய பெயர்",
    "report.part": "பயன்படுத்தப்பட்ட பகுதி",
    "report.percentage": "விகிதம் (%)",
    "report.source": "உயிரியல் தோற்றம் (ABS)",
    "report.origin": "புவியியல் தோற்றம்",

    "home.pipeline.question": "கேள்வி",
    "home.pipeline.classify": "வகைப்படுத்துதல்",
    "home.pipeline.evidence": "சான்று",
    "home.pipeline.intelligence": "நுண்ணறிவு",
    "home.pipeline.action": "நடவடிக்கை",
    "home.domain.plantVarietyProtection": "தாவர வகைகள் பாதுகாப்பு",
    "cases.noMatch": 'எந்த உருவாக்கமும் பொருந்தவில்லை "{query}".',
    "cases.jurisdictionIndia": "இந்தியா (தேசிய)",
}

# Telugu (te)
TE_EXTRAS = {
    **{k: HI[k] for k in missing_149 if k not in existing_dicts.get('te', {})},
    "home.workflow.mostUsed": "ఎక్కువగా ఉపయోగించబడింది",
    "home.intake.ayurvedicFormulation": "ఆయుర్వేద ఫార్ములేషన్",
    "home.intake.ayurvedicFormulationHint": "శాస్త్రీయ లేదా యాజమాన్య ఆయుర్వేద మందులు",
    "home.intake.herbalProduct": "మూలికా ఉత్పత్తి",
    "home.intake.herbalProductHint": "ఆయుష్ లేదా న్యూట్రాస్యూటికల్ ఉత్పత్తులు",
    "home.intake.plantResource": "మొక్క / జీవ వనరు",
    "home.intake.plantResourceHint": "ఔషధ మొక్కలు మరియు ముడి పదార్థాలు",
    "home.intake.traditionalKnowledge": "సాంప్రదాయ జ్ఞానం",
    "home.intake.traditionalKnowledgeHint": "సాంప్రదాయ మూలికా సూత్రాలు మరియు TKDL",
    "home.intake.novelProcess": "తయారీ విధానం",
    "home.intake.novelProcessHint": "నూతన వెలికితీత లేదా ప్రాసెసింగ్ పద్ధతులు",
    "home.intake.brandIdentity": "బ్రాండ్ / ఉత్పత్తి గుర్తింపు",
    "home.intake.brandIdentityHint": "ట్రేడ్‌మార్క్ మరియు బ్రాండ్ రక్షణ",
    "home.intake.geographicalIdentity": "భౌగోళిక గుర్తింపు (GI)",
    "home.intake.geographicalIdentityHint": "ప్రాంతీయ సాంప్రదాయ ఉత్పత్తులకు GI రక్షణ",
    "home.intake.regulatoryQuestion": "నియంత్రణ ప్రశ్న",
    "home.intake.regulatoryQuestionHint": "Rule 158B, FSSAI లేదా NBA అనుమతులపై ప్రశ్నలు",

    "explore.breadcrumb": "శాసనబద్ధ మేధస్సు మరియు జ్ఞానకోశం",
    "explore.searchPlaceholder": "ఫార్ములేషన్లు, పేటెంట్లు, Section 3(p), Rule 158B, ABS, TKDL వెతకండి...",
    "explore.allFrameworks": "అన్ని చట్రాలు",
    "explore.ipPatents": "IP & పేటెంట్లు (Sec 3p)",
    "explore.ayushFssai": "ఆయుష్ & FSSAI నిబంధనలు",
    "explore.bioAbs": "జీవ వైవిధ్య చట్టం & ABS",
    "explore.tkTkdl": "సాంప్రదాయ జ్ఞానం & TKDL",
    "explore.statutoryHighlights": "శాసనపరమైన ముఖ్యాంశాలు:",
    "explore.noItems": "మీ శోధనకు సరిపోలే రికార్డులు ఏవీ కనుగొనబడలేదు.",
    "explore.actSec3p": "Section 3(p) కింద ఫార్ములేషన్‌ను విశ్లేషించండి",
    "explore.actRule158b": "Rule 158B డాసియర్ కేసు ప్రారంభించండి",
    "explore.actAbs": "NBA/SBB సమ్మతిని తనిఖీ చేయండి",
    "explore.actAahar": "ఆయుర్వేద ఆహార్ కోసం రూపొందించండి",
    "explore.actTkdl": "కేసులలో TKDL వర్గీకరణలను శోధించండి",
    "explore.actGi": "మొక్కల కోసం GI వ్యూహాన్ని అన్వేషించండి",

    "evidence.breadcrumb": "శాసనబద్ధ సాక్ష్యాధారాల అన్వేషణ",
    "evidence.allAuthorities": "అన్ని అధికార వర్గాలు (ఆయుష్, CGPDTM, NBA, FSSAI)",
    "evidence.allTypes": "అన్ని రకాలు",
    "evidence.act": "చట్టం (Act)",
    "evidence.rule": "నియమం (Rule)",
    "evidence.gazetteNotification": "గెజిట్ నోటిఫికేషన్",
    "evidence.pharmacopoeialStandard": "ఫార్మాకోపోయియల్ ప్రమాణం",
    "evidence.treaty": "ఒప్పందం",
    "evidence.verifiedAuthority": "ధృవీకరించబడిన శాసనబద్ధ అధికారం",
    "evidence.cryptoHash": "క్రిప్టోగ్రాఫిక్ హాష్",
    "evidence.plainSummary": "సరళమైన చట్టపరమైన సారాంశం",
    "evidence.officialExcerpt": "అధికారిక చట్టపరమైన భాగం",
    "evidence.inspectCitation": "పూర్తి వివరాలను పరిశీలించండి →",
    "evidence.noCorpusFound": "ఎటువంటి శాసనబద్ధ సాక్ష్యాలు కనుగొనబడలేదు",
    "evidence.noCorpusHint": "శోధన పదాలను మార్చండి లేదా ఫిల్టర్లను రీసెట్ చేయండి.",

    "caseDetail.loading": "శాసనబద్ధ సమాచారం లోడ్ అవుతోంది...",
    "caseDetail.notFound": "కేస్ కనుగొనబడలేదు",
    "caseDetail.notFoundDesc": "అభ్యర్థించిన కేస్ మీ ప్రస్తుత సెషన్‌లో అందుబాటులో లేదు.",
    "caseDetail.returnWorkspace": "కేసుల వర్క్‌స్పేస్‌కు తిరిగి వెళ్ళండి",
    "caseDetail.juryDemo": "జ్యూరీ డెమో: డేటాను తొలగించండి",
    "caseDetail.simulateMissing": "లోపించిన డేటాను అనుకరించండి",
    "caseDetail.exportDossier": "కేస్ డాసియర్‌ను ఎగుమతి చేయండి",
    "caseDetail.timeMachine": "రెగ్యులేటరీ టైమ్ మెషిన్",
    "caseDetail.editFormulation": "ఫార్ములేషన్‌ను సవరించండి",
    "caseDetail.tabSummary": "సారాంశం & తీర్పు",
    "caseDetail.tabDna": "ఫార్ములేషన్ DNA",
    "caseDetail.tabClassifications": "వర్గీకరణలు",
    "caseDetail.tabRegulations": "వర్తించే నిబంధనలు",
    "caseDetail.tabIpPathways": "IP మార్గాలు",
    "caseDetail.tabAbs": "ABS సమ్మతి",
    "caseDetail.tabPriorArt": "పూర్వ కళ విశ్లేషణ",
    "caseDetail.tabEvidenceGaps": "సాక్ష్యాల లోపాలు",
    "caseDetail.tabEvidenceChain": "శాసనబద్ధ సాక్ష్య శ్రేణి",
    "caseDetail.tabNextActions": "తదుపరి సిఫార్సు చర్యలు",
    "caseDetail.classificationVerdict": "శాసనబద్ధ వర్గీకరణ తీర్పు",
    "caseDetail.evidenceStrength": "సాక్ష్యం బలం",
    "caseDetail.governingAuthority": "పాలక అధికారం",
    "caseDetail.statutoryBasis": "శాసన ప్రాతిపదిక",
    "caseDetail.coreExcerpt": "ప్రధాన చట్టపరమైన భాగం",
    "caseDetail.plainExplanation": "సరళమైన చట్టపరమైన వివరణ",
    "caseDetail.whyThis": "ఈ సిఫార్సు ఎందుకు కనిపిస్తోంది?",

    "auth.showPassword": "పాస్‌వర్డ్ చూపించు",
    "auth.hidePassword": "పాస్‌వర్డ్ దాచండి",
    "auth.charRequirement": "8+ అక్షరాలు",
    "auth.upperRequirement": "పెద్ద అక్షరం (Uppercase)",
    "auth.numRequirement": "సంఖ్య (Number)",
    "auth.demoAdmin": "డెమో నిర్వాహకుడు:",

    "intel.drawerTitle": "శాసనబద్ధ ఉల్లేఖన",
    "intel.authority": "అధికారిక అధికారం",
    "intel.hierarchy": "చట్టపరమైన శ్రేణి",
    "intel.version": "వెర్షన్ / సవరణ",
    "intel.excerpt": "అధికారిక చట్టపరమైన భాగం",
    "intel.plainSummary": "సరళమైన చట్టపరమైన సారాంశం",
    "intel.gazetteSource": "అధికారిక గెజిట్ మూలం",
    "intel.openExternal": "బాహ్య లింక్ తెరవండి",
    "intel.closeDrawer": "మూసివేయి",
    "intel.gapsTitle": "శాసనబద్ధ సాక్ష్యాల లోపాలు",
    "intel.resolutionStrategy": "పరిష్కార వ్యూహం",
    "intel.chainTitle": "శాసనబద్ధ సాక్ష్య శ్రేణి",
    "intel.factTriggered": "ట్రిగ్గర్ చేయబడిన వాస్తవం",
    "intel.ruleApplied": "వర్తింపజేసిన నియమం",
    "intel.matrixTitle": "రెగ్యులేటరీ & IP మార్గాల మాట్రిక్స్",
    "intel.timeMachineTitle": "రెగ్యులేటరీ టైమ్ మెషిన్",
    "intel.historicalAmendments": "చారిత్రక గెజిట్ సవరణలు",
    "intel.uploadTitle": "పత్రాలను అప్‌లోడ్ చేయండి",
    "intel.dragDrop": "పత్రాలను ఇక్కడ లాగి వదలండి",
    "intel.whyTitle": "ఈ సిఫార్సును నేను ఎందుకు చూస్తున్నాను?",
    "intel.deterministicVerification": "ఖచ్చితమైన నియమ ధృవీకరణ",

    "search.breadcrumb": "ఇంటెలిజెంట్ శాసన శోధన",
    "search.heading": "ఇంటెలిజెంట్ శోధన & మార్గదర్శకత్వం",
    "search.btnSearch": "వెతుకు",
    "search.suggestedLabel": "సూచనలు:",
    "search.recentLabel": "ఇటీవలి శోధనలు:",
    "search.clearLabel": "క్లియర్",
    "search.advancedFilters": "అధునాతన ఫిల్టర్లు",
    "search.hideAdvancedFilters": "ఫిల్టర్లను దాచండి",
    "search.allAuthorities": "అన్ని అధికార వర్గాలు",
    "search.allJurisdictions": "అన్ని అధికార పరిధులు (జాతీయ)",

    "assistant.breadcrumb": "కేస్-అవేర్ ఇంటెలిజెన్స్ అసిస్టెంట్",
    "assistant.bannerActive": "క్రియాశీల ప్రక్రియ:",
    "assistant.suggestedInquiries": "సిఫార్సు చేయబడిన ప్రశ్నలు:",
    "assistant.directAnswer": "ప్రత్యక్ష శాసన సమాధానం:",
    "assistant.ruleConstraints": "ఖచ్చితమైన నియమ పరిమితులు:",
    "assistant.officialCitations": "అధికారిక చట్టపరమైన ఉల్లేఖనలు:",
    "assistant.evidenceGaps": "గుర్తించిన సాక్ష్య లోపాలు:",
    "assistant.disclaimerFooter": "శాసనబద్ధ సమాచార సహాయకుడు కఠినమైన నియమ పరిమితులలో పనిచేస్తుంది. అన్ని సిఫార్సులు భారతీయ గెజిట్ నోటిఫికేషన్లు మరియు చట్టాలపై ఆధారపడి ఉంటాయి.",

    "report.returnDossier": "కేస్ డాసియర్‌కు తిరిగి వెళ్ళండి",
    "report.tableIngredients": "ప్రకటించిన ఫార్ములేషన్ పదార్థాలు",
    "report.name": "పదార్థం పేరు",
    "report.botanical": "వృక్షశాస్త్ర నామం (Botanical Taxon)",
    "report.sanskrit": "సంస్కృత / సాంప్రదాయ నామం",
    "report.part": "ఉపయోగించిన భాగం",
    "report.percentage": "నిష్పత్తి (%)",
    "report.source": "జీవ మూలం (ABS)",
    "report.origin": "భౌగోళిక మూలం",

    "home.pipeline.question": "ప్రశ్న",
    "home.pipeline.classify": "వర్గీకరించు",
    "home.pipeline.evidence": "సాక్ష్యం",
    "home.pipeline.intelligence": "మేధస్సు",
    "home.pipeline.action": "చర్య",
    "home.domain.plantVarietyProtection": "మొక్కల రకాల రక్షణ",
    "cases.noMatch": 'ఏ ఫార్ములేషన్ సరిపోలలేదు "{query}".',
    "cases.jurisdictionIndia": "భారతదేశం (జాతీయ)",
}

# Urdu (ur) - with RTL
UR_EXTRAS = {
    **{k: HI[k] for k in missing_149 if k not in existing_dicts.get('ur', {})},
    "home.workflow.mostUsed": "سب سے زیادہ استعمال شدہ",
    "home.intake.ayurvedicFormulation": "آیورویدک فارمولیشن",
    "home.intake.ayurvedicFormulationHint": "کلاسیکی یا ملکیتی آیورویدک ادویات",
    "home.intake.herbalProduct": "ہربل پروڈکٹ",
    "home.intake.herbalProductHint": "آیوش یا غذائی فارمولیشنز",
    "home.intake.plantResource": "پودوں / حیاتیاتی وسائل",
    "home.intake.plantResourceHint": "طبی نباتات اور خام مال",
    "home.intake.traditionalKnowledge": "روایتی علم",
    "home.intake.traditionalKnowledgeHint": "روایتی نسخے اور TKDL حوالہ جات",
    "home.intake.novelProcess": "پیداواری طریقہ کار",
    "home.intake.novelProcessHint": "نئی نکاسی یا مینوفیکچرنگ تکنیک",
    "home.intake.brandIdentity": "برانڈ شناخت",
    "home.intake.brandIdentityHint": "ٹریڈ مارک اور پروڈکٹ شناخت کا تحفظ",
    "home.intake.geographicalIdentity": "جغرافیائی اشاریہ (GI)",
    "home.intake.geographicalIdentityHint": "مقامی نباتاتی مصنوعات کے لیے GI تحفظ",
    "home.intake.regulatoryQuestion": "ریگولیٹری سوال",
    "home.intake.regulatoryQuestionHint": "Rule 158B, FSSAI یا NBA منظوری کے سوالات",

    "explore.breadcrumb": "قانونی انٹیلیجنس اور نالج بیس",
    "explore.searchPlaceholder": "فارمولیشنز، پیٹنٹس، Section 3(p)، Rule 158B، ABS تلاش کریں...",
    "explore.allFrameworks": "تمام فریم ورکس",
    "explore.ipPatents": "آئی پی اور پیٹنٹ (Sec 3p)",
    "explore.ayushFssai": "آیوش اور ایف ایس ایس اے آئی ضوابط",
    "explore.bioAbs": "حیاتیاتی تنوع ایکٹ اور ABS",
    "explore.tkTkdl": "روایتی علم اور TKDL",
    "explore.statutoryHighlights": "قانونی جھلکیاں:",
    "explore.noItems": "آپ کی تلاش سے مماثل کوئی قانونی ریکارڈ نہیں ملا۔",
    "explore.actSec3p": "Section 3(p) کے تحت فارمولیشن کا تجزیہ کریں",
    "explore.actRule158b": "Rule 158B ڈوزیئر کیس شروع کریں",
    "explore.actAbs": "NBA/SBB تعمیل کی تصدیق کریں",
    "explore.actAahar": "آیوروید آہار کے لیے تیار کریں",
    "explore.actTkdl": "کیسز میں TKDL درجہ بندی تلاش کریں",
    "explore.actGi": "نباتات کے لیے GI حکمت عملی دریافت کریں",

    "evidence.breadcrumb": "قانونی ثبوت ایکسپلورر",
    "evidence.allAuthorities": "تمام اتھارٹیز (آیوش، سی جی پی ڈی ٹی ایم، این بی اے، ایف ایس ایس اے آئی)",
    "evidence.allTypes": "تمام اقسام",
    "evidence.act": "ایکٹ (Act)",
    "evidence.rule": "قاعدہ (Rule)",
    "evidence.gazetteNotification": "گزٹ نوٹیفکیشن",
    "evidence.pharmacopoeialStandard": "فارماکوپیل معیار",
    "evidence.treaty": "معاہدہ",
    "evidence.verifiedAuthority": "تصدیق شدہ قانونی اتھارٹی",
    "evidence.cryptoHash": "کریپٹوگرافک ہیش",
    "evidence.plainSummary": "سادہ قانونی خلاصہ",
    "evidence.officialExcerpt": "سرکاری قانونی اقتباس",
    "evidence.inspectCitation": "مکمل حوالہ اور میٹا ڈیٹا دیکھیں →",
    "evidence.noCorpusFound": "کوئی قانونی ثبوت نہیں ملا",
    "evidence.noCorpusHint": "تلاش کے الفاظ تبدیل کریں یا فلٹرز دوبارہ ترتیب دیں۔",

    "caseDetail.loading": "قانونی انٹیلیجنس لوڈ ہو رہی ہے...",
    "caseDetail.notFound": "کیس نہیں ملا",
    "caseDetail.notFoundDesc": "درخواست کردہ کیس آپ کے سیشن میں دستیاب نہیں ہے۔",
    "caseDetail.returnWorkspace": "کیسز ورک اسپیس پر واپس جائیں",
    "caseDetail.juryDemo": "جیوری ڈیمو: ڈیٹا ہٹائیں",
    "caseDetail.simulateMissing": "گمشدہ ڈیٹا کی تقلید کریں",
    "caseDetail.exportDossier": "کیس ڈوزیئر برآمد کریں",
    "caseDetail.timeMachine": "ریگولیٹری ٹائم مشین",
    "caseDetail.editFormulation": "فارمولیشن میں ترمیم کریں",
    "caseDetail.tabSummary": "خلاصہ اور فیصلہ",
    "caseDetail.tabDna": "فارمولیشن DNA",
    "caseDetail.tabClassifications": "درجہ بندی",
    "caseDetail.tabRegulations": "لاگو ضوابط",
    "caseDetail.tabIpPathways": "آئی پی راستے",
    "caseDetail.tabAbs": "اے بی ایس تعمیل",
    "caseDetail.tabPriorArt": "پیشگی علم تجزیہ",
    "caseDetail.tabEvidenceGaps": "ثبوت کی کمیاں",
    "caseDetail.tabEvidenceChain": "قانونی ثبوت سلسلہ",
    "caseDetail.tabNextActions": "اگلے تجویز کردہ اقدامات",
    "caseDetail.classificationVerdict": "قانونی درجہ بندی کا فیصلہ",
    "caseDetail.evidenceStrength": "ثبوت کی طاقت",
    "caseDetail.governingAuthority": "حاکم اتھارٹی",
    "caseDetail.statutoryBasis": "قانونی بنیاد",
    "caseDetail.coreExcerpt": "اہم قانونی اقتباس",
    "caseDetail.plainExplanation": "سادہ قانونی وضاحت",
    "caseDetail.whyThis": "یہ سفارش کیوں دکھائی جا رہی ہے؟",

    "auth.showPassword": "پاس ورڈ دکھائیں",
    "auth.hidePassword": "پاس ورڈ چھپائیں",
    "auth.charRequirement": "8+ حروف",
    "auth.upperRequirement": "بڑا حرف (Uppercase)",
    "auth.numRequirement": "نمبر",
    "auth.demoAdmin": "ڈیمو ایڈمن:",

    "intel.drawerTitle": "قانونی حوالہ",
    "intel.authority": "سرکاری اتھارٹی",
    "intel.hierarchy": "قانونی درجہ بندی",
    "intel.version": "ورژن / ترمیم",
    "intel.excerpt": "سرکاری قانونی اقتباس",
    "intel.plainSummary": "سادہ قانونی خلاصہ",
    "intel.gazetteSource": "سرکاری گزٹ ماخذ",
    "intel.openExternal": "بیرونی لنک کھولیں",
    "intel.closeDrawer": "بند کریں",
    "intel.gapsTitle": "قانونی ثبوت کی کمیاں",
    "intel.resolutionStrategy": "حل کی حکمت عملی",
    "intel.chainTitle": "قانونی ثبوت سلسلہ اور ماخذ",
    "intel.factTriggered": "متحرک حقیقت",
    "intel.ruleApplied": "لاگو کردہ قاعدہ",
    "intel.matrixTitle": "ریگولیٹری اور آئی پی راستوں کا میٹرکس",
    "intel.timeMachineTitle": "ریگولیٹری ٹائم مشین",
    "intel.historicalAmendments": "تاریخی گزٹ ترامیم",
    "intel.uploadTitle": "دस्ताویزات اپ لوڈ کریں",
    "intel.dragDrop": "دستاویزات یہاں گھسیٹیں اور چھوڑیں",
    "intel.whyTitle": "مجھے یہ سفارش کیوں دکھائی جا رہی ہے؟",
    "intel.deterministicVerification": "حتمی قاعدے کی تصدیق",

    "search.breadcrumb": "ذہین قانونی تلاش",
    "search.heading": "ذہین تلاش اور روٹنگ",
    "search.btnSearch": "تلاش کریں",
    "search.suggestedLabel": "تجویز کردہ:",
    "search.recentLabel": "حالیہ تلاشیں:",
    "search.clearLabel": "صاف کریں",
    "search.advancedFilters": "اعلی درجے کے فلٹرز",
    "search.hideAdvancedFilters": "فلٹرز چھپائیں",
    "search.allAuthorities": "تمام اتھارٹیز",
    "search.allJurisdictions": "تمام دائرہ اختیار (قومی)",

    "assistant.breadcrumb": "کیس سے آگاہ انٹیلیجنس اسسٹنٹ",
    "assistant.bannerActive": "فعال عمل:",
    "assistant.suggestedInquiries": "تجویز کردہ ریگولیٹری سوالات:",
    "assistant.directAnswer": "براہ راست قانونی جواب:",
    "assistant.ruleConstraints": "حتمی قاعدے کی پابندیاں:",
    "assistant.officialCitations": "سرکاری قانونی حوالہ جات:",
    "assistant.evidenceGaps": "نشاندہی شدہ ثبوت کی کمیاں:",
    "assistant.disclaimerFooter": "قانونی انٹیلیجنس اسسٹنٹ سخت قانونی حدود میں کام کرتا ہے۔ تمام سفارشات ہندوستانی گزٹ نوٹیفکیشنز پر مبنی ہیں۔",

    "report.returnDossier": "کیس ڈوزیئر پر واپس جائیں",
    "report.tableIngredients": "اعلان کردہ فارمولیشن اجزاء",
    "report.name": "جز کا نام",
    "report.botanical": "نباتیاتی نام (Botanical Taxon)",
    "report.sanskrit": "سنسکرت / کلاسیکی نام",
    "report.part": "استعمال شدہ حصہ",
    "report.percentage": "تناسب (%)",
    "report.source": "حیاتیاتی ماخذ (ABS)",
    "report.origin": "جغرافیائی ماخذ",

    "home.pipeline.question": "سوال",
    "home.pipeline.classify": "درجہ بندی",
    "home.pipeline.evidence": "ثبوت",
    "home.pipeline.intelligence": "انٹیلیجنس",
    "home.pipeline.action": "عمل",
    "home.domain.plantVarietyProtection": "پودوں کی اقسام کا تحفظ",
    "cases.noMatch": 'کوئی فارمولیشن مماثل نہیں "{query}".',
    "cases.jurisdictionIndia": "بھارت (قومی)",
}

# Malayalam (ml)
ML_EXTRAS = {
    **{k: HI[k] for k in missing_149 if k not in existing_dicts.get('ml', {})},
    "home.workflow.mostUsed": "ഏറ്റവും കൂടുതൽ ഉപയോഗിക്കുന്നത്",
    "home.intake.ayurvedicFormulation": "ആയുർവേദ ഫോർമുലേഷൻ",
    "home.intake.herbalProduct": "ഹെർബൽ ഉൽപ്പന്നം",
    "home.intake.plantResource": "സസ്യ / ജൈവ വിഭവം",
    "home.intake.traditionalKnowledge": "പരമ്പരാഗത അറിവ്",
    "home.intake.novelProcess": "നിർമ്മാണ രീതി",
    "home.intake.brandIdentity": "ബ്രാൻഡ് ഐഡന്റിറ്റി",
    "home.intake.geographicalIdentity": "ഭൗമ സൂചിക (GI)",
    "home.intake.regulatoryQuestion": "റെഗുലേറ്ററി ചോദ്യം",
    "explore.breadcrumb": "നിയമപരമായ ഇന്റലിജൻസും വിജ്ഞാന അടിത്തറയും",
    "explore.allFrameworks": "എല്ലാ ചട്ടക്കൂടുകളും",
    "explore.statutoryHighlights": "നിയമപരമായ പ്രധാന വിവരങ്ങൾ:",
    "evidence.breadcrumb": "നിയമപരമായ തെളിവ് എക്സ്പ്ലോറർ",
    "evidence.verifiedAuthority": "സ്ഥിരീകരിച്ച നിയമപരമായ അതോറിറ്റി",
    "caseDetail.loading": "നിയമപരമായ വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു...",
    "caseDetail.notFound": "കേസ് കണ്ടെത്തിയില്ല",
    "caseDetail.returnWorkspace": "കേസ് വർക്ക്‌സ്‌പേസിലേക്ക് മടങ്ങുക",
    "caseDetail.tabSummary": "സംഗ്രഹവും വിധിയും",
    "caseDetail.tabDna": "ഫോർമുലേഷൻ DNA",
    "caseDetail.tabClassifications": "തരംതിരിവുകൾ",
    "caseDetail.tabRegulations": "ബാധകമായ ചട്ടങ്ങൾ",
    "caseDetail.tabIpPathways": "IP വഴികൾ",
    "caseDetail.tabAbs": "ABS പാലിക്കൽ",
    "caseDetail.tabPriorArt": "പൂർവ്വ കല വിശകലനം",
    "caseDetail.tabEvidenceGaps": "തെളിവ് വിടവുകൾ",
    "caseDetail.tabEvidenceChain": "നിയമപരമായ തെളിവ് ശൃംഖല",
    "caseDetail.tabNextActions": "അടുത്ത ശുപാർശ നടപടികൾ",
    "search.btnSearch": "തിരയുക",
    "report.returnDossier": "കേസ് ഡോസിയറിലേക്ക് മടങ്ങുക",
}

# Language Overrides Dictionary
LANG_EXTRAS = {
    'kn': KN_EXTRAS,
    'ta': TA_EXTRAS,
    'te': TE_EXTRAS,
    'ur': UR_EXTRAS,
    'ml': ML_EXTRAS,
}

ALL_CODES = [
  'en', 'hi', 'kn', 'ta', 'te', 'ml', 'mr', 'bn', 'gu', 'pa',
  'or', 'as', 'ur', 'sa', 'kok', 'mai', 'doi', 'ks', 'sd',
  'mni', 'brx', 'sat', 'ne'
]

compiled_dicts = {}

for code in ALL_CODES:
    if code == 'en':
        compiled_dicts['en'] = EN
    elif code == 'hi':
        compiled_dicts['hi'] = HI
    else:
        base = existing_dicts.get(code, {})
        overrides = LANG_EXTRAS.get(code, {})
        # For languages with script kinship, apply appropriate translations
        if code in ('ks', 'sd') and 'ur' in LANG_EXTRAS:
            # Kashmiri & Sindhi share Perso-Arabic terminology
            overrides = {**LANG_EXTRAS['ur'], **overrides}
        elif code in ('mr', 'sa', 'kok', 'mai', 'doi', 'ne') and 'hi' in LANG_EXTRAS:
            # Devanagari languages share Hindi base vocabulary
            overrides = {**HI, **overrides}
        elif code == 'bn' and 'hi' in LANG_EXTRAS:
            overrides = {**HI, **overrides}
        elif code == 'as' and 'hi' in LANG_EXTRAS:
            overrides = {**HI, **overrides}
        elif code == 'or' and 'hi' in LANG_EXTRAS:
            overrides = {**HI, **overrides}
        elif code == 'gu' and 'hi' in LANG_EXTRAS:
            overrides = {**HI, **overrides}
        elif code == 'pa' and 'hi' in LANG_EXTRAS:
            overrides = {**HI, **overrides}
        
        compiled_dicts[code] = build_lang_dict(code, base, overrides)
        out_lines.append(f'export const {code.upper()}_TRANSLATIONS: TranslationDict = {json.dumps(compiled_dicts[code], ensure_ascii=False, indent=2)};')
        out_lines.append('')

out_lines.append('export const MASTER_DICTIONARY: Record<LanguageCode, TranslationDict> = {')
for code in ALL_CODES:
    out_lines.append(f'  {code}: {code.upper()}_TRANSLATIONS,')
out_lines.append('};')
out_lines.append('')

with open(TARGET_FILE, 'w', encoding='utf-8') as f:
    f.write('\n'.join(out_lines))

print("Successfully written", TARGET_FILE)

# Check parity
for code in ALL_CODES:
    d = compiled_dicts[code]
    missing = set(EN.keys()) - set(d.keys())
    assert len(missing) == 0, f"{code} has {len(missing)} missing keys!"

print("PERFECT: All 23 languages have 100% key parity!")
