import re

with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    content = f.read()

# All new intelligence keys for EN, HI, KN
INTEL_KEYS = {
    'EN': {
        'intel.act': 'Act',
        'intel.chapter': 'Chapter',
        'intel.section': 'Section',
        'intel.subsection': 'Subsection',
        'intel.clause': 'Clause',
        'intel.whatSourceEstablishes': 'Establishes authoritative statutory criteria and binding regulatory mandates.',
        'intel.whatSourceDoesNotEstablish': 'Does not constitute a granted patent, drug license approval, or formal SBB certificate. The existence of this statutory rule does not guarantee administrative success.',
        'intel.noGapsTitle': 'No Critical Evidence Gaps Detected',
        'intel.noGapsDesc': 'All core statutory parameters are specified for this formulation.',
        'intel.dynamicallyEvaluated': 'Dynamically evaluated against Patent & AYUSH Rules',
        'intel.groundingTraceActive': 'Grounding Trace Active',
        'intel.groundingTraceDesc': 'Trace how your formulation parameters flowed through entity extraction, deterministic rules, statutory retrieval, and recommended legal actions without hidden AI hallucination.',
        'intel.attachDocsDesc': 'Attach Certificates of Analysis (CoA), research notes, or Mandi purchase receipts to ground case evidence.',
        'intel.maxFileSize': 'Max: 10MB · Scanned & Quarantined',
        'intel.supportedFormats': 'Supports PDF, DOCX, TXT, CSV, JSON',
        'intel.cleanVerified': 'CLEAN & VERIFIED',
        'intel.quarantined': 'QUARANTINED',
        'intel.securityPrinciple': 'Security Principle:',
        'intel.securityPrincipleDesc': 'All document contents are treated as untrusted user submissions. Extracted parameters cannot override deterministic statutory rules or fabricate patent grant eligibility.',
        'intel.provenanceTracer': 'PROVENANCE TRACER',
        'intel.timeMachineDesc': 'Audit historical amendments, gazette notifications, and statutory clause evolution.',
        'intel.selectFramework': 'Select Framework:',
        'intel.gazettePdf': 'Official Gazette PDF',
        'intel.clauseComparison': 'Clause-by-Clause Comparison & Practical Analysis',
        'intel.previousText': 'Previous / Original Text',
        'intel.amendedText': 'Amended / Enacted Text',
        'intel.sec3pBar': 'Sec 3(p) Bar',
        'intel.applicable': 'Applicable',
        'intel.synergyRequired': 'Synergistic technical data required to overcome Section 3(p).',
        'intel.slaGmpRequired': 'Requires State AYUSH Licensing Authority Schedule T GMP approval.',
        'intel.sbbSec7Mandatory': 'Mandatory Prior Intimation',
        'intel.sbbSec7Exemption': 'Exemption Review',
        'intel.nbaSec6Title': 'Prior Form III Approval for Patent Grant',
        'intel.benefitSharingRate': 'Ex-factory benefit sharing rate: 0.1% to 0.5%.',
        'intel.actionSbb': '1. File SBB Form I intimation',
        'intel.actionCoa': '2. NABL Heavy metals & microbial CoA',
        'intel.actionTm': '3. Trademark Class 5 application',
    },
    'HI': {
        'intel.act': 'अधिनियम',
        'intel.chapter': 'अध्याय',
        'intel.section': 'धारा',
        'intel.subsection': 'उप-धारा',
        'intel.clause': 'खंड',
        'intel.whatSourceEstablishes': 'प्राधिकृत वैधानिक मानदंड और बाध्यकारी विनियामक आदेश स्थापित करता है।',
        'intel.whatSourceDoesNotEstablish': 'यह स्वीकृत पेटेंट, औषधि लाइसेंस अनुमोदन या औपचारिक SBB प्रमाणपत्र नहीं है। इस वैधानिक नियम का अस्तित्व प्रशासनिक सफलता की गारंटी नहीं देता है।',
        'intel.noGapsTitle': 'कोई महत्वपूर्ण साक्ष्य अंतराल नहीं मिला',
        'intel.noGapsDesc': 'इस योग के लिए सभी मुख्य वैधानिक पैरामीटर निर्दिष्ट हैं।',
        'intel.dynamicallyEvaluated': 'पेटेंट एवं आयुष नियमों के विरुद्ध गतिशील रूप से मूल्यांकित',
        'intel.groundingTraceActive': 'आधारभूत ट्रेसिंग सक्रिय',
        'intel.groundingTraceDesc': 'बिना किसी एआई अटकल के ट्रेस करें कि आपके योग पैरामीटर कैसे घटक निष्कर्षण, नियमों, वैधानिक पुनर्प्राप्ति और अनुशंसित विधिक कार्रवाइयों से गुजरे हैं।',
        'intel.attachDocsDesc': 'प्रकरण साक्ष्य को पुष्ट करने के लिए विश्लेषण प्रमाणपत्र (CoA), अनुसंधान नोट्स या मंडी रसीद संलग्न करें।',
        'intel.maxFileSize': 'अधिकतम: 10MB · स्कैन एवं पृथक्कृत',
        'intel.supportedFormats': 'PDF, DOCX, TXT, CSV, JSON समर्थित',
        'intel.cleanVerified': 'स्वच्छ एवं सत्यापित',
        'intel.quarantined': 'पृथक्कृत (क्वारंटाइन)',
        'intel.securityPrinciple': 'सुरक्षा सिद्धांत:',
        'intel.securityPrincipleDesc': 'सभी दस्तावेज़ सामग्री को अविश्वसनीय उपयोगकर्ता सबमिशन माना जाता है। निकाले गए पैरामीटर वैधानिक नियमों को ओवरराइड या पेटेंट पात्रता गढ़े नहीं जा सकते।',
        'intel.provenanceTracer': 'मूल स्रोत ट्रेसर',
        'intel.timeMachineDesc': 'ऐतिहासिक संशोधनों, राजपत्र अधिसूचनाओं और वैधानिक खंडों के विकास का ऑडिट करें।',
        'intel.selectFramework': 'ढांचा चुनें:',
        'intel.gazettePdf': 'आधिकारिक राजपत्र PDF',
        'intel.clauseComparison': 'खंड-दर-खंड तुलना एवं व्यावहारिक विश्लेषण',
        'intel.previousText': 'पूर्व / मूल पाठ',
        'intel.amendedText': 'संशोधित / अधिनियमित पाठ',
        'intel.sec3pBar': 'धारा 3(p) रोक',
        'intel.applicable': 'लागू',
        'intel.synergyRequired': 'Section 3(p) से छूट पाने हेतु सहक्रियाशील तकनीकी डेटा आवश्यक है।',
        'intel.slaGmpRequired': 'राज्य आयुष लाइसेंसिंग प्राधिकरण Schedule T GMP अनुमोदन आवश्यक है।',
        'intel.sbbSec7Mandatory': 'अनिवार्य पूर्व सूचना',
        'intel.sbbSec7Exemption': 'छूट समीक्षा',
        'intel.nbaSec6Title': 'पेटेंट अनुदान हेतु पूर्व Form III अनुमोदन',
        'intel.benefitSharingRate': 'कारखाना-निकासी लाभ साझाकरण दर: 0.1% से 0.5%।',
        'intel.actionSbb': '1. SBB Form I सूचना दाखिल करें',
        'intel.actionCoa': '2. NABL भारी धातु एवं सूक्ष्मजीवी CoA',
        'intel.actionTm': '3. Class 5 में ट्रेडमार्क आवेदन',
    },
    'KN': {
        'intel.act': 'ಕಾಯಿದೆ',
        'intel.chapter': 'ಅಧ್ಯಾಯ',
        'intel.section': 'ವಿಭಾಗ',
        'intel.subsection': 'ಉಪವಿಭಾಗ',
        'intel.clause': 'ಷರತ್ತು / ಖಂಡ',
        'intel.whatSourceEstablishes': 'ಅಧಿಕೃತ ಶಾಸನಬದ್ಧ ಮಾನದಂಡಗಳು ಮತ್ತು ಬದ್ಧ ನಿಯಂತ್ರಕ ಆದೇಶಗಳನ್ನು ಸ್ಥಾಪಿಸುತ್ತದೆ.',
        'intel.whatSourceDoesNotEstablish': 'ಇದು ನೀಡಲಾದ ಪೇಟೆಂಟ್, ಔಷಧ ಪರವಾನಗಿ ಅನುಮೋದನೆ ಅಥವಾ ಔಪಚಾರಿಕ SBB ಪ್ರಮಾಣಪತ್ರವಲ್ಲ. ಈ ಶಾಸನಬದ್ಧ ನಿಯಮದ ಅಸ್ತಿತ್ವವು ಆಡಳಿತಾತ್ಮಕ ಯಶಸ್ಸನ್ನು ಖಾತರಿಪಡಿಸುವುದಿಲ್ಲ.',
        'intel.noGapsTitle': 'ಯಾವುದೇ ನಿರ್ಣಾಯಕ ಪುರಾವೆ ಕೊರತೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
        'intel.noGapsDesc': 'ಈ ಸೂತ್ರೀಕರಣಕ್ಕಾಗಿ ಎಲ್ಲಾ ಪ್ರಮುಖ ಶಾಸನಬದ್ಧ ನಿಯತಾಂಕಗಳನ್ನು ನಿರ್ದಿಷ್ಟಪಡಿಸಲಾಗಿದೆ.',
        'intel.dynamicallyEvaluated': 'ಪೇಟೆಂಟ್ ಮತ್ತು ಆಯುಷ್ ನಿಯಮಗಳ ವಿರುದ್ಧ ಕ್ರಿಯಾತ್ಮಕವಾಗಿ ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗಿದೆ',
        'intel.groundingTraceActive': 'ನೆಲೆಗಟ್ಟಿನ ಪತ್ತೆಹಚ್ಚುವಿಕೆ ಸಕ್ರಿಯವಾಗಿದೆ',
        'intel.groundingTraceDesc': 'ಯಾವುದೇ ಎಐ ಕಲ್ಪನೆ ಇಲ್ಲದೆ ನಿಮ್ಮ ಸೂತ್ರೀಕರಣದ ನಿಯತಾಂಕಗಳು ಘಟಕ ಹೊರತೆಗೆಯುವಿಕೆ, ನಿಯಮಗಳು, ಶಾಸನಬದ್ಧ ಮರುಪಡೆಯುವಿಕೆ ಮತ್ತು ಶಿಫಾರಸು ಮಾಡಲಾದ ಕ್ರಮಗಳ ಮೂಲಕ ಹೇಗೆ ಹರಿದಿವೆ ಎಂಬುದನ್ನು ಟ್ರೇಸ್ ಮಾಡಿ.',
        'intel.attachDocsDesc': 'ಪ್ರಕರಣದ ಸಾಕ್ಷ್ಯವನ್ನು ಬಲಪಡಿಸಲು ವಿಶ್ಲೇಷಣೆ ಪ್ರಮಾಣಪತ್ರ (CoA), ಸಂಶೋಧನಾ ಟಿಪ್ಪಣಿಗಳು ಅಥವಾ ಮಂಡಿ ಖರೀದಿ ರಸೀದಿಗಳನ್ನು ಲಗತ್ತಿಸಿ.',
        'intel.maxFileSize': 'ಗರಿಷ್ಠ: 10MB · ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗಿದೆ ಮತ್ತು ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ',
        'intel.supportedFormats': 'PDF, DOCX, TXT, CSV, JSON ಬೆಂಬಲಿಸುತ್ತದೆ',
        'intel.cleanVerified': 'ಸ್ವಚ್ಛ ಮತ್ತು ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
        'intel.quarantined': 'ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ (ಕ್ವಾರಂಟೈನ್)',
        'intel.securityPrinciple': 'ಭದ್ರತಾ ತತ್ವ:',
        'intel.securityPrincipleDesc': 'ಎಲ್ಲಾ ದಾಖಲೆ ವಿಷಯಗಳನ್ನು ವಿಶ್ವಾಸಾರ್ಹವಲ್ಲದ ಬಳಕೆದಾರ ಸಲ್ಲಿಕೆಗಳೆಂದು ಪರಿಗಣಿಸಲಾಗುತ್ತದೆ. ಹೊರತೆಗೆಯಲಾದ ನಿಯತಾಂಕಗಳು ಶಾಸನಬದ್ಧ ನಿಯಮಗಳನ್ನು ಅತಿಕ್ರಮಿಸಲು ಅಥವಾ ಪೇಟೆಂಟ್ ಅರ್ಹತೆಯನ್ನು ಕೃತಕವಾಗಿ ಸೃಷ್ಟಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.',
        'intel.provenanceTracer': 'ಮೂಲ ಪತ್ತೆಹಚ್ಚುವಿಕೆ (Provenance)',
        'intel.timeMachineDesc': 'ಐತಿಹಾಸಿಕ ತಿದ್ದುಪಡಿಗಳು, ಗೆಜೆಟ್ ಅಧಿಸೂಚನೆಗಳು ಮತ್ತು ಶಾಸನಬದ್ಧ ಷರತ್ತುಗಳ ವಿಕಾಸವನ್ನು ಪರಿಶೋಧಿಸಿ.',
        'intel.selectFramework': 'ಚೌಕಟ್ಟನ್ನು ಆಯ್ಕೆಮಾಡಿ:',
        'intel.gazettePdf': 'ಅಧಿಕೃತ ಗೆಜೆಟ್ PDF',
        'intel.clauseComparison': 'ಷರತ್ತು-ವಾರು ಹೋಲಿಕೆ ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ವಿಶ್ಲೇಷಣೆ',
        'intel.previousText': 'ಹಿಂದಿನ / ಮೂಲ ಪಠ್ಯ',
        'intel.amendedText': 'ತಿದ್ದುಪಡಿ ಮಾಡಿದ / ಜಾರಿಗೆ ತರಲಾದ ಪಠ್ಯ',
        'intel.sec3pBar': 'ಸೆಕ್ಷನ್ 3(p) ನಿರ್ಬಂಧ',
        'intel.applicable': 'ಅನ್ವಯಿಸುತ್ತದೆ',
        'intel.synergyRequired': 'Section 3(p) ನಿರ್ಬಂಧವನ್ನು ನಿವಾರಿಸಲು ಸಿನರ್ಜಿಸ್ಟಿಕ್ ತಾಂತ್ರಿಕ ಡೇಟಾ ಅಗತ್ಯವಿದೆ.',
        'intel.slaGmpRequired': 'ರಾಜ್ಯ ಆಯುಷ್ ಪರವಾನಗಿ ಪ್ರಾಧಿಕಾರ Schedule T GMP ಅನುಮೋದನೆ ಅಗತ್ಯವಿದೆ.',
        'intel.sbbSec7Mandatory': 'ಕಡ್ಡಾಯ ಮುಂಚಿತ ಮಾಹಿತಿ ಸಲ್ಲಿಕೆ',
        'intel.sbbSec7Exemption': 'ವಿನಾಯಿತಿ ಪರಿಶೀಲನೆ',
        'intel.nbaSec6Title': 'ಪೇಟೆಂಟ್ ಮಂಜೂರಾತಿಗಾಗಿ ಪೂರ್ವ Form III ಅನುಮೋದನೆ',
        'intel.benefitSharingRate': 'ಕಾರ್ಖಾನೆ-ಹೊರಗಿನ ಲಾಭ ಹಂಚಿಕೆ ದರ: 0.1% ರಿಂದ 0.5%.',
        'intel.actionSbb': '1. SBB Form I ಮಾಹಿತಿ ಸಲ್ಲಿಸಿ',
        'intel.actionCoa': '2. NABL ಲೋಹಗಳು ಮತ್ತು ಸೂಕ್ಷ್ಮಾಣು CoA ಪ್ರಮಾಣಪತ್ರ',
        'intel.actionTm': '3. Class 5 ರಲ್ಲಿ ಟ್ರೇಡ್‌ಮಾರ್ಕ್ ಅರ್ಜಿ',
    }
}

langs = ['EN', 'HI', 'KN', 'TA', 'TE', 'ML', 'MR', 'BN', 'GU', 'PA', 'OR', 'AS', 'UR', 'SA', 'KOK', 'MAI', 'DOI', 'KS', 'SD', 'MNI', 'BRX', 'SAT', 'NE']

print("Injecting intel keys into dictionaries...")
for l in langs:
    tag = f"export const {l}_TRANSLATIONS: TranslationDict = {{"
    pos = content.find(tag)
    if pos == -1:
        continue
    
    if l in INTEL_KEYS:
        kmap = INTEL_KEYS[l]
    elif l in ['SA', 'KOK', 'MAI', 'DOI', 'BRX', 'NE', 'MR']:
        kmap = INTEL_KEYS['HI']
    else:
        kmap = INTEL_KEYS['EN']
    
    lines_to_add = []
    for k, v in kmap.items():
        v_esc = v.replace('"', '\\"')
        lines_to_add.append(f'  "{k}": "{v_esc}",')
    
    insert_text = "\n" + "\n".join(lines_to_add)
    insert_pos = pos + len(tag)
    content = content[:insert_pos] + insert_text + content[insert_pos:]
    print(f"Added {len(lines_to_add)} intel keys to {l}_TRANSLATIONS")

with open('frontend/src/i18n/translations/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved index.ts with all intelligence keys!")
