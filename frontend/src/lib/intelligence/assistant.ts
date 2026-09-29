/**
 * IP-SAKTI Sahayak — Case-Aware Assistant & Multilingual Statutory Intelligence
 * SIH26045
 * 
 * Generates structured decision-support responses grounded in case context
 * and authoritative statutory evidence across all Indian languages.
 */

import { CaseItem } from '@/store/cases';
import { StructuredAssistantResponse, Citation } from './types';
import { STATUTORY_CORPUS } from './corpus';
import { LanguageCode, getLanguageMeta } from '@/i18n/languages';

function makeCitation(corpusKey: string, relevance: string): Citation {
  const src = STATUTORY_CORPUS[corpusKey] || STATUTORY_CORPUS['PATENTS_ACT_SEC_3P'];
  return {
    sourceId: src.id,
    sourceTitle: src.title,
    authority: src.authority,
    hierarchy: src.hierarchy,
    version: src.version,
    status: src.status,
    relevanceExplanation: relevance,
    supportingExcerpt: src.officialExcerpt,
    canonicalUrl: src.canonicalUrl,
  };
}

// Prompt Injection Sanitizer
function sanitizeInput(text: string): { cleanText: string; isSuspect: boolean } {
  const suspectPatterns = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /override\s+system\s+rules/i,
    /you\s+are\s+now\s+(in\s+)?dan\s+mode/i,
    /jailbreak/i,
    /act\s+as\s+a\s+unrestricted/i,
    /bypass\s+safety/i,
    /give\s+me\s+a\s+legal\s+guarantee/i,
    /100%\s+guarantee/i,
  ];

  const isSuspect = suspectPatterns.some((pattern) => pattern.test(text));
  return {
    cleanText: text.trim().substring(0, 500),
    isSuspect,
  };
}

/**
 * Script & language detector for incoming queries
 */
export function detectQueryLanguage(text: string, fallback: LanguageCode = 'en'): LanguageCode {
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
  if (/[\u0980-\u09FF]/.test(text)) return fallback === 'as' ? 'as' : 'bn'; // Bengali / Assamese
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or'; // Odia
  if (/[\u0600-\u06FF]/.test(text)) return fallback === 'ks' || fallback === 'sd' ? fallback : 'ur'; // Perso-Arabic
  if (/[\u1C50-\u1C7F]/.test(text)) return 'sat'; // Santali
  if (/[\u0900-\u097F]/.test(text)) {
    if (['mr', 'sa', 'ne', 'kok', 'mai', 'doi', 'brx'].includes(fallback)) return fallback;
    return 'hi'; // Devanagari default
  }
  return fallback;
}

export function generateAssistantResponse(
  userPrompt: string,
  caseData?: CaseItem,
  language: LanguageCode = 'en'
): StructuredAssistantResponse {
  const { cleanText, isSuspect } = sanitizeInput(userPrompt);
  const q = cleanText.toLowerCase();
  const effectiveLang = detectQueryLanguage(cleanText, language);
  const langMeta = getLanguageMeta(effectiveLang);

  // Prompt injection containment
  if (isSuspect) {
    const injectionResponses: Partial<Record<LanguageCode, { answer: string; why: string }>> = {
      hi: {
        answer: 'IP-SAKTI सख्त वैधानिक सीमाओं के अधीन कार्य करता है। सुरक्षा नियमों को अनदेखा करने या विधिक गारंटी प्राप्त करने के अनुरोध अनुमत नहीं हैं।',
        why: 'नियामक निर्णय समर्थन हेतु सत्यापन योग्य अधिनियमों पर आधारित होना अनिवार्य है।',
      },
      kn: {
        answer: 'IP-SAKTI ಕಟ್ಟುನಿಟ್ಟಾದ ಶಾಸನಬದ್ಧ ಮಿತಿಗಳ ಅಡಿಯಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ. ಸುರಕ್ಷತಾ ನಿಯಮಗಳನ್ನು ಬೈಪಾಸ್ ಮಾಡುವ ಅಥವಾ ಕಾನೂನು ಗ್ಯಾರಂಟಿಗಳನ್ನು ಕೇಳುವ ಪ್ರಾಂಪ್ಟ್‌ಗಳನ್ನು ಅನುಮತಿಸಲಾಗುವುದಿಲ್ಲ.',
        why: 'ನಿಯಂತ್ರಕ ನಿರ್ಧಾರ ಬೆಂಬಲವು ಪರಿಶೀಲಿಸಿದ ಕಾನೂನುಗಳ ಮೇಲೆ ಆಧಾರಿತವಾಗಿರಬೇಕು.',
      },
      ta: {
        answer: 'IP-SAKTI கடுமையான சட்ட எல்லைகளுக்கு உட்பட்டு செயல்படுகிறது. பாதுகாப்பு விதிகளை மீறும் அல்லது சட்டப்பூர்வ உத்தரவாதங்களைக் கோரும் வினவல்கள் அனுமதிக்கப்படாது.',
        why: 'ஒழுங்குமுறை முடிவெடுப்பது சரிபார்க்கப்பட்ட சட்டங்களின் அடிப்படையில் மட்டுமே அமைய வேண்டும்.',
      },
      te: {
        answer: 'IP-SAKTI కఠినమైన చట్టబద్ధమైన పరిమితులలో పనిచేస్తుంది. భద్రతా నియమాలను ఉల్లంఘించే లేదా చట్టపరమైన హామీలను కోరే ప్రాంప్ట్‌లు అనుమతించబడవు.',
        why: 'నియంత్రణ నిర్ణయ మద్దతు ధృవీకరించబడిన చట్టాల ఆధారంగా మాత్రమే ఉండాలి.',
      },
    };

    const localized = injectionResponses[effectiveLang] || {
      answer: 'IP-SAKTI operates under strict statutory constraints. Prompts attempting to override safety principles, guarantee legal outcomes, or bypass authoritative evidence retrieval are not permitted.',
      why: 'Regulatory decision support requires grounding in verified statutes rather than arbitrary language model instructions.',
    };

    return {
      answer: localized.answer,
      why: localized.why,
      evidence: [],
      whatIsMissing: ['Valid statutory question relating to intellectual property, AYUSH regulations, or ABS compliance.'],
      whatThisMeans: 'System safeguards remain active to protect against legal misinformation.',
      nextAction: ['Please submit a question concerning patent eligibility, ASU licensing, or biodiversity compliance.'],
      confidence: 'INSUFFICIENT_EVIDENCE',
      confidenceExplanation: 'System safeguard triggered on untrusted input.',
      isAbstained: true,
    };
  }

  // Safe Abstention Check: Question outside supported corpus
  const isOutOfScope =
    q.includes('bitcoin') ||
    q.includes('cryptocurrency') ||
    q.includes('real estate') ||
    q.includes('divorce') ||
    q.includes('criminal defense');

  if (isOutOfScope) {
    const outOfScopeAnswers: Partial<Record<LanguageCode, string>> = {
      hi: 'IP-SAKTI के पास इस विषय हेतु अधिकृत वैधानिक साक्ष्य उपलब्ध नहीं हैं। हमारा ज्ञानकोश केवल भारतीय बौद्धिक संपदा (Patents, Trademarks, GI), आयुष औषधि एवं प्रसाधन सामग्री नियमों (D&C Rules) और जैव विविधता अधिनियम (ABS) तक सीमित है।',
      kn: 'IP-SAKTI ಬಳಿ ಈ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಅಧಿಕೃತ ಶಾಸನಬದ್ಧ ಪುರಾವೆಗಳಿಲ್ಲ. ನಮ್ಮ ಡೇಟಾಬೇಸ್ ಕೇವಲ ಭಾರತೀಯ ಬೌದ್ಧಿಕ ಆಸ್ತಿ (ಪೇಟೆಂಟ್‌ಗಳು, ಟ್ರೇಡ್‌ಮಾರ್ಕ್‌ಗಳು), ಆಯುಷ್ ನಿಯಮಗಳು ಮತ್ತು ಜೈವಿಕ ವೈವಿಧ್ಯ ಕಾಯಿದೆ (ABS) ಗೆ ಸೀಮಿತವಾಗಿದೆ.',
      ta: 'இந்த தலைப்புக்கான அதிகாரப்பூர்வ சட்ட சான்றுகள் IP-SAKTI-யில் இல்லை. எங்கள் தரவுத்தளம் இந்திய அறிவுசார் சொத்துரிமை, ஆயுஷ் விதிமுறைகள் மற்றும் பல்லுயிர் சட்டம் (ABS) ஆகியவற்றிற்கு மட்டுமே உட்பட்டது.',
      te: 'ఈ అంశానికి సంబంధించి IP-SAKTI వద్ద అధికారిక చట్టబద్ధ ఆధారాలు అందుబాటులో లేవు. మా నిఘంటువు కేవలం భారతీయ ఐపీ, ఆయుష్ నిబంధనలు మరియు జీవ వైవిధ్య చట్టం (ABS) లకు మాత్రమే పరిమితం.',
    };

    return {
      answer: outOfScopeAnswers[effectiveLang] ||
        'IP-SAKTI does not have authoritative evidence for this domain. Our statutory corpus is exclusively grounded in Indian Intellectual Property (Patents, Trademarks, GI), AYUSH Drugs & Cosmetics regulations, and Biological Diversity Act (ABS) compliance.',
      why: 'The submitted query exceeds the verified legal corpus of traditional medicine and intellectual property.',
      evidence: [],
      whatIsMissing: ['Question within the scope of Ayurvedic, Siddha, Unani, or botanical IP and regulation.'],
      whatThisMeans: 'Safe abstention is triggered to prevent hallucination in unsupported legal fields.',
      nextAction: [
        'Consult an appropriate legal domain specialist for non-AYUSH inquiries.',
        'Ask about Section 3(p) patenting, Rule 158B licensing, or NBA Form I/III requirements.',
      ],
      confidence: 'INSUFFICIENT_EVIDENCE',
      confidenceExplanation: 'Out-of-corpus query triggers mandatory safe abstention.',
      isAbstained: true,
    };
  }

  // Safe Abstention Check: Legal Guarantee or Compliance Certification
  const isGuaranteeQuery =
    q.includes('guarantee') ||
    q.includes('गारंटी') ||
    q.includes('वारंटी') ||
    q.includes('ಖಾತರಿ') ||
    q.includes('ಗ್ಯಾರಂಟಿ') ||
    q.includes('உத்தரவாதம்') ||
    q.includes('హామీ');

  if (isGuaranteeQuery) {
    const guaranteeAnswers: Partial<Record<LanguageCode, { answer: string; why: string }>> = {
      hi: {
        answer: 'IP-SAKTI किसी भी पेटेंट अनुदान अथवा विधिक सफलता की 100% गारंटी नहीं दे सकता। पेटेंट की स्वीकृति पूर्णतः भारतीय पेटेंट कार्यालय के परीक्षक के मूल्यांकन, पूर्वकला (Prior Art) और धारा 3(p) की वैधानिक शर्तों पर निर्भर करती है।',
        why: 'विधिक एवं विनियामक परिणाम प्रशासनिक विवेक और परीक्षा प्रक्रिया के अधीन होते हैं, जिनकी कोई एआई या सलाहकार गारंटी नहीं दे सकता।',
      },
      kn: {
        answer: 'IP-SAKTI ಯಾವುದೇ ಪೇಟೆಂಟ್ ಮಂಜೂರಾತಿ ಅಥವಾ ಕಾನೂನು ಯಶಸ್ಸಿಗೆ 100% ಗ್ಯಾರಂಟಿ ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ಪೇಟೆಂಟ್ ಅನುಮೋದನೆಯು ಭಾರತೀಯ ಪೇಟೆಂಟ್ ಕಚೇರಿಯ ಪರೀಕ್ಷಕರ ಮೌಲ್ಯಮಾಪನ, ಪೂರ್ವಕಲೆ (Prior Art) ಮತ್ತು Section 3(p) ಶಾಸನಬದ್ಧ ಷರತ್ತುಗಳ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ.',
        why: 'ಕಾನೂನು ಮತ್ತು ನಿಯಂತ್ರಕ ಫಲಿತಾಂಶಗಳು ಆಡಳಿತಾತ್ಮಕ ವಿವೇಚನೆಗೆ ಒಳಪಟ್ಟಿರುತ್ತವೆ, ಆದ್ದರಿಂದ ಯಾವುದೇ ಎಐ ವ್ಯವಸ್ಥೆಯು ಖಾತರಿ ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ.',
      },
      ta: {
        answer: 'IP-SAKTI எந்தவொரு காப்புரிமை ஒப்புதலுக்கும் 100% உத்தரவாதம் அளிக்க முடியாது. காப்புரிமை வழங்குவது இந்திய காப்புரிமை அலுவலகத்தின் பரிசோதனை, முன் கலை (Prior Art) மற்றும் Section 3(p) விதிகளுக்கு உட்பட்டது.',
        why: 'சட்டரீதியான முடிவுகள் நிர்வாக ஆய்வுக்கு உட்பட்டவை, இதற்கு எந்தவொரு அமைப்பும் உத்தரவாதம் தர முடியாது.',
      },
      te: {
        answer: 'IP-SAKTI ఎలాంటి పేటెంట్ మంజూరు లేదా చట్టపరమైన విజయానికి 100% హామీ ఇవ్వలేదు. పేటెంట్ ఆమోదం అనేది భారత పేటెంట్ కార్యాలయ పరీక్ష, పూర్వ కళ (TKDL) మరియు Section 3(p) నిబంధనలపై ఆధారపడి ఉంటుంది.',
        why: 'చట్టపరమైన మరియు నియంత్రణ ఫలితాలు పరిపాలనా నిర్ణయాలపై ఆధారపడి ఉంటాయి.',
      },
    };

    const localized = guaranteeAnswers[effectiveLang] || {
      answer: 'IP-SAKTI cannot guarantee that any patent will be granted or that any regulatory filing will succeed. Patent grant decisions are strictly within the statutory discretion of the Indian Patent Office (IPO) and require overcoming Section 3(p) and Section 3(e) prior art hurdles.',
      why: 'Statutory outcomes depend on formal patent examiner evaluation and verified clinical/synergistic evidence, which no automated intelligence tool can guarantee.',
    };

    return {
      answer: localized.answer,
      why: localized.why,
      evidence: [
        makeCitation('PATENTS_ACT_SEC_3P', 'Section 3(p) creates a statutory hurdle requiring empirical non-obviousness before any patent grant.'),
      ],
      whatIsMissing: ['Formal prior-art search report and examination by the Controller of Patents.'],
      whatThisMeans: 'The system operates as a decision-support guide, not an indemnifying or outcome-guaranteeing legal counsel.',
      nextAction: [
        'Conduct a formal TKDL prior-art search.',
        'Obtain laboratory synergy data (Combination Index < 1.0) before filing.',
      ],
      confidence: 'INSUFFICIENT_EVIDENCE',
      confidenceExplanation: 'Outcome guarantee requests trigger mandatory safe abstention.',
      isAbstained: true,
    };
  }

  // Case context summary
  const caseTitle = caseData?.title || 'General Ayurvedic Asset';
  const ingredients = caseData?.formulation?.ingredients || [];
  const ingNames = ingredients.map((i) => i.name).join(', ') || 'botanical ingredients';

  // Topic 1: Patent & Section 3(p)
  const isPatentQuery =
    q.includes('patent') ||
    q.includes('पेटेंट') ||
    q.includes('ಪೇಟೆಂಟ್') ||
    q.includes('காப்புரிமை') ||
    q.includes('పేటెంట్') ||
    q.includes('পেটেন্ট') ||
    q.includes('பரிசோதனை') ||
    q.includes('3(p)') ||
    q.includes('3p') ||
    q.includes('invent') ||
    q.includes('novelty');

  if (isPatentQuery) {
    if (effectiveLang === 'kn') {
      return {
        answer: `"${caseTitle}" ಸೂತ್ರೀಕರಣಕ್ಕೆ ನೇರ ಪೇಟೆಂಟ್ ಪಡೆಯಲು ಭಾರತೀಯ ಪೇಟೆಂಟ್ ಕಾಯಿದೆ, 1970 ರ Section 3(p) ಅಡಿಯಲ್ಲಿ ಶಾಸನಬದ್ಧ ನಿರ್ಬಂಧ ಎದುರಾಗುತ್ತದೆ. ಏಕೆಂದರೆ ${ingNames} ನ ಗುಣಲಕ್ಷಣಗಳು ಶಾಸ್ತ್ರೀಯ ಆಯುರ್ವೇದ ಗ್ರಂಥಗಳಲ್ಲಿ ಮೊದಲೇ ದಾಖಲಾಗಿವೆ. ಆದರೆ ಅನಿರೀಕ್ಷಿತ ಸಿನರ್ಜಿಸ್ಟಿಕ್ ಪರಿಣಾಮ (synergistic efficacy) ಅಥವಾ ನವೀನ ಹೊರತೆಗೆಯುವ ವಿಧಾನವನ್ನು (extraction method) ಸಾಬೀತುಪಡಿಸಿದರೆ ಪೇಟೆಂಟ್ ಸಾಧ್ಯವಾಗಬಹುದು.`,
        why: `ಭಾರತೀಯ ಪೇಟೆಂಟ್ ಕಾಯಿದೆ, 1970 ರ Section 3(p) ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನವನ್ನು (Traditional Knowledge) ಮತ್ತು Section 3(e) ಕೇವಲ ಮಿಶ್ರಣಗಳನ್ನು ಆವಿಷ್ಕಾರವೆಂದು ಪರಿಗಣಿಸುವುದಿಲ್ಲ.`,
        evidence: [
          makeCitation('PATENTS_ACT_SEC_3P', 'ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನದ ಸೂತ್ರೀಕರಣಗಳಿಗೆ ಪೇಟೆಂಟ್ ನಿರ್ಬಂಧ (Section 3(p)).'),
          makeCitation('PATENTS_ACT_SEC_3E', 'ಸಿನರ್ಜಿಸ್ಟಿಕ್ ಪರಿಣಾಮವಿಲ್ಲದ ಕೇವಲ ಮಿಶ್ರಣಗಳ ಹೊರಗಿಡುವಿಕೆ (Section 3(e)).'),
          makeCitation('PATENTS_ACT_SEC_10_4', 'ಪೇಟೆಂಟ್ ಅರ್ಜಿಯಲ್ಲಿ ಜೈವಿಕ ಮೂಲದ ಕಡ್ಡಾಯ ಬಹಿರಂಗಪಡಿಸುವಿಕೆ (Section 10(4)(ii)(D)).'),
        ],
        whatIsMissing: [
          'ಪ್ರಮಾಣೀಕೃತ ಪ್ರಯೋಗಾಲಯದಿಂದ ಸಿನರ್ಜಿ ಸೂಚ್ಯಂಕ (Combination Index < 1.0) ಫಲಿತಾಂಶ.',
          'ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ ಡಿಜಿಟಲ್ ಲೈಬ್ರರಿ (TKDL) ಪೂರ್ವಕಲೆ (Prior Art) ಶೋಧನಾ ವರದಿ.',
        ],
        whatThisMeans: `ತಿಳಿದಿರುವ ಗಿಡಮೂಲಿಕೆಗಳನ್ನು (${ingNames}) ಕೇವಲ ಮಿಶ್ರಣ ಮಾಡುವುದರಿಂದ ಪೇಟೆಂಟ್ ಸಿಗುವುದಿಲ್ಲ. ಈ ಸಂಯೋಜನೆಯು ಪ್ರತ್ಯೇಕ ಘಟಕಗಳಿಗಿಂತ ಹೆಚ್ಚಿನ ಚಿಕಿತ್ಸಕ ಗುಣವನ್ನು ತೋರಿಸುತ್ತದೆ ಎಂದು ಪ್ರಾಯೋಗಿಕ ದತ್ತಾಂಶದಿಂದ ಸಾಬೀತುಪಡಿಸಬೇಕು.`,
        nextAction: [
          '1. ಪ್ರಯೋಗಾಲಯದಿಂದ Combination Index / Isobologram ಪರೀಕ್ಷೆಯನ್ನು ನಡೆಸಿ.',
          '2. ಪೇಟೆಂಟ್‌ಗೆ ಮುಂಚಿತವಾಗಿ ರಾಷ್ಟ್ರೀಯ ಜೈವಿಕ ವೈವಿಧ್ಯ ಪ್ರಾಧಿಕಾರದಿಂದ (NBA) Form III ಅನುಮೋದನೆಗೆ ಸಿದ್ಧತೆ ನಡೆಸಿ.',
          '3. ಬ್ರ್ಯಾಂಡ್ ರಕ್ಷಣೆಗಾಗಿ Class 5 ರಲ್ಲಿ ಟ್ರೇಡ್‌ಮಾರ್ಕ್ (Trademark) ನೋಂದಣಿ ಮಾಡಿಕೊಳ್ಳಿ.',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Grounded directly in Sections 3(p), 3(e), and 10(4) of The Patents Act, 1970. Translated explanation for convenience; canonical citations govern.',
        isAbstained: false,
      };
    }

    if (effectiveLang === 'ta') {
      return {
        answer: `"${caseTitle}" சூத்திரத்திற்கு நேரடி காப்புரிமை (Patent) பெறுவது இந்திய காப்புரிமைச் சட்டம், 1970 இன் Section 3(p) இன் கீழ் தடையை எதிர்கொள்கிறது, ஏனெனில் ${ingNames} பாரம்பரிய ஆயுர்வேத நூல்களில் ஆவணப்படுத்தப்பட்டுள்ளது. இருப்பினும், எதிர்பாராத ஒருங்கிணைந்த செயல்திறனை (synergistic efficacy) நிரூபிப்பதன் மூலம் அல்லது புதிய பிரித்தெடுக்கும் தொழில்நுட்பத்திற்கு காப்புரிமை பெறலாம்.`,
        why: `காப்புரிமை சட்டம் 1970 இன் Section 3(p) பாரம்பரிய அறிவை (Traditional Knowledge) கண்டுபிடிப்பாக ஏற்க மறுக்கிறது மற்றும் Section 3(e) வெறும் கலவைகளை விலக்குகிறது.`,
        evidence: [
          makeCitation('PATENTS_ACT_SEC_3P', 'பாரம்பரிய அறிவு சூத்திரங்களுக்கான சட்டப்பூர்வ தடை (Section 3(p)).'),
          makeCitation('PATENTS_ACT_SEC_3E', 'தொழில்நுட்ப சினெர்ஜி இல்லாத வெறும் கலவைகளை விலக்குதல் (Section 3(e)).'),
          makeCitation('PATENTS_ACT_SEC_10_4', 'உயிரியல் மூலத்தின் கட்டாய வெளிப்படுத்தல் (Section 10(4)(ii)(D)).'),
        ],
        whatIsMissing: [
          'அங்கீகரிக்கப்பட்ட ஆய்வகத்திலிருந்து சினெர்ஜி குறியீட்டு (Combination Index < 1.0) சோதனை தரவு.',
          'பாரம்பரிய அறிவு டிஜிட்டல் நூலகத்தில் (TKDL) முன் கலை (Prior Art) தேடல் அறிக்கை.',
        ],
        whatThisMeans: `அறியப்பட்ட ஆயுர்வேத மூலிகைகளை (${ingNames}) வெறும் கலவையாக சேர்ப்பதால் காப்புரிமை பெற முடியாது. தனித்தனி மூலிகைகளை விட இந்த கலவை அதிக ஆற்றல் கொண்டது என்பதை ஆய்வக தரவுகள் மூலம் நிரூபிக்க வேண்டும்.`,
        nextAction: [
          '1. Combination Index / Isobologram பரிசோதனையை மேற்கொள்ளுங்கள்.',
          '2. காப்புரிமைக்கு முன் தேசிய பல்லுயிர் ஆணையத்திடம் (NBA) Form III ஒப்புதல் பெற தயாராகுங்கள்.',
          '3. பிராண்ட் பாதுகாப்பிற்காக Class 5 இல் வர்த்தக முத்திரை (Trademark) பதிவு செய்யுங்கள்.',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Grounded directly in Sections 3(p), 3(e), and 10(4) of The Patents Act, 1970. Canonical citations preserved.',
        isAbstained: false,
      };
    }

    if (effectiveLang === 'te') {
      return {
        answer: `"${caseTitle}" ఫార్ములేషన్‌కు నేరుగా పేటెంట్ పొందడం భారతీయ పేటెంట్ చట్టం, 1970 లోని Section 3(p) క్రింద చట్టబద్ధమైన అడ్డంకిని ఎదుర్కొంటుంది. ఎందుకంటే ${ingNames} యొక్క లక్షణాలు సాంప్రదాయ ఆయుర్వేద గ్రంథాలలో ముందే నమోదయ్యాయి. అయితే, సాంకేతిక సినర్జీ (synergy) లేదా నూతన వెలికితీత ప్రక్రియను నిరూపిస్తే పేటెంట్ సాధ్యమవుతుంది.`,
        why: `భారత పేటెంట్ చట్టం 1970 లోని Section 3(p) సాంప్రదాయ జ్ఞానాన్ని ఆవిష్కరణగా గుర్తించదు మరియు Section 3(e) సాధారణ మిశ్రమాలను మినహాయిస్తుంది.`,
        evidence: [
          makeCitation('PATENTS_ACT_SEC_3P', 'సాంప్రదాయ విజ్ఞాన ఫార్ములేషన్ల పేటెంట్ నిషేధం (Section 3(p)).'),
          makeCitation('PATENTS_ACT_SEC_3E', 'సినర్జీ లేని కేవలం మిశ్రమాల మినహాయింపు (Section 3(e)).'),
          makeCitation('PATENTS_ACT_SEC_10_4', 'జీవ వనరుల మూలాన్ని వెల్లడించే తప్పనిసరి ప్రకటన (Section 10(4)(ii)(D)).'),
        ],
        whatIsMissing: [
          'ప్రయోగశాల నుండి సినర్జీ సూచిక (Combination Index < 1.0) పరీక్ష సమాచారం.',
          'సాంప్రదాయ విజ్ఞాన డిజిటల్ లైబ్రరీ (TKDL) పూర్వ కళ (Prior Art) శోధన నివేదిక.',
        ],
        whatThisMeans: `తెలిసిన ఆయుర్వేద మూలికలను (${ingNames}) కలపడం ద్వారా మాత్రమే పేటెంట్ పొందలేరు. విడి భాగాల కంటే ఈ మిశ్రమం అత్యున్నత చికిత్సా ప్రభావాన్ని చూపుతుందని నిరూపించాలి.`,
        nextAction: [
          '1. అక్రిడిటెడ్ ల్యాబ్‌లో కాంబినేషన్ ఇండెక్స్ పరీక్ష నిర్వహించండి.',
          '2. నేషనల్ బయోడైవర్సిటీ అథారిటీ (NBA) నుండి Form III అనుమతి కోసం దరఖాస్తును సిద్ధం చేయండి.',
          '3. క్లాస్ 5 లో ట్రేడ్‌మార్క్ (Trademark) నమోదును పరిశీలించండి.',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Supported by Sections 3(p), 3(e), and 10(4) of The Patents Act, 1970.',
        isAbstained: false,
      };
    }

    if (effectiveLang === 'hi') {
      return {
        answer: `"${caseTitle}" के लिए, सीधे फॉर्मूलेशन का पेटेंट भारतीय पेटेंट अधिनियम की Section 3(p) की वैधानिक बाधा का सामना करता है, क्योंकि ${ingNames} के गुण पहले से शास्त्रीय संहिताओं में प्रलेखित हैं। हालांकि, अप्रत्याशित सहक्रियाशीलता (synergistic efficacy) सिद्ध करने या नवीन निष्कर्षण तकनीक पर पेटेंट प्राप्त किया जा सकता है।`,
        why: `भारतीय पेटेंट अधिनियम, 1970 की Section 3(p) पारंपरिक ज्ञान को और Section 3(e) केवल ज्ञात घटकों के मिश्रण को आविष्कार नहीं मानती।`,
        evidence: [
          makeCitation('PATENTS_ACT_SEC_3P', 'पारंपरिक ज्ञान के फॉर्मूलेशन पर पेटेंट का वैधानिक निषेध (Section 3(p))।'),
          makeCitation('PATENTS_ACT_SEC_3E', 'सहक्रियाशीलता के बिना केवल मिश्रणों का निषेध (Section 3(e))।'),
          makeCitation('PATENTS_ACT_SEC_10_4', 'पेटेंट आवेदन में जैविक सामग्री के भौगोलिक स्रोत का अनिवार्य प्रकटीकरण (Section 10(4)(ii)(D))।'),
        ],
        whatIsMissing: [
          'मान्यता प्राप्त प्रयोगशाला से सहक्रियाशीलता सूचकांक (Combination Index < 1.0) का प्रयोगात्मक डेटा।',
          'पारंपरिक ज्ञान डिजिटल पुस्तकालय (TKDL) में पूर्व-कला (Prior Art) खोज रिपोर्ट।',
        ],
        whatThisMeans: `केवल ज्ञात आयुर्वेदिक जड़ी-बूटियों (${ingNames}) को मिलाने से पेटेंट नहीं मिल सकता। आपको प्रयोगात्मक डेटा द्वारा यह सिद्ध करना होगा कि यह मिश्रण व्यक्तिगत घटकों के योग से अधिक उपचारात्मक प्रभाव उत्पन्न करता है।`,
        nextAction: [
          '1. प्रयोगशाला से Combination Index / Isobologram परीक्षण कराएं।',
          '2. पेटेंट से पूर्व राष्ट्रीय जैव विविधता प्राधिकरण (NBA) से Form III अनुमोदन प्राप्त करने हेतु स्रोत की तैयारी करें।',
          '3. ब्रांड सुरक्षा हेतु Class 5 में ट्रेडमार्क (Trademark) पंजीकरण पर विचार करें।',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Directly supported by Sections 3(p), 3(e), and 10(4) of The Patents Act, 1970.',
        isAbstained: false,
      };
    }

    // Default English / localized fallback with canonical statutory IDs
    const localizedHeader = effectiveLang !== 'en' ? `[${langMeta.nativeName} Explanation | Statutory Source: English]\n\n` : '';
    return {
      answer: `${localizedHeader}For "${caseTitle}", direct formulation patenting faces the Section 3(p) statutory bar because ${ingNames} have documented classical medicinal precedent. However, patent eligibility is possible if you demonstrate unexpected technical synergy or focus claims on novel extraction apparatus.`,
      why: `Section 3(p) of the Patents Act, 1970 excludes inventions that are traditional knowledge or aggregations of known properties. Section 3(e) further excludes mere admixtures with only additive effects.`,
      evidence: [
        makeCitation('PATENTS_ACT_SEC_3P', 'Statutory exclusion of traditional knowledge formulations (Section 3(p)).'),
        makeCitation('PATENTS_ACT_SEC_3E', 'Exclusion of mere aggregations without technical synergy (Section 3(e)).'),
        makeCitation('PATENTS_ACT_SEC_10_4', 'Mandatory biological origin disclosure in patent specifications (Section 10(4)(ii)(D)).'),
      ],
      whatIsMissing: [
        'Experimental combination index assay data (< 1.0) proving synergistic technical effect.',
        'Novelty search report across CSIR Traditional Knowledge Digital Library (TKDL).',
      ],
      whatThisMeans: `You cannot obtain a patent merely by combining known Ayurvedic herbs like ${ingNames}. You must file comparative assay data proving that the combined formula achieves an unexpected therapeutic result beyond the sum of its parts. (Translated explanation for convenience. Refer to cited official sources for authoritative legal text.)`,
      nextAction: [
        '1. Commission combination index / isobologram assay testing at an accredited laboratory.',
        '2. Disclose the domestic cultivation source of herbs to prepare for NBA Form III approval.',
        '3. Consider trademark registration in Class 5 as an immediate proprietary brand protection measure.',
      ],
      confidence: 'HIGH_EVIDENCE',
      confidenceExplanation: 'Directly supported by Sections 3(p), 3(e), and 10(4) of The Patents Act, 1970.',
      isAbstained: false,
    };
  }

  // Topic 2: FSSAI Ayurveda-Aahar (Specific dietary formulation category)
  if (q.includes('fssai') || q.includes('aahar') || q.includes('food') || q.includes('dietary') || q.includes('ಆಹಾರ') || q.includes('உணவு') || q.includes('आहार')) {
    if (effectiveLang === 'kn') {
      return {
        answer: `"${caseTitle}" ಅನ್ನು ಆಯುರ್ವೇದ ಆಹಾರ (Ayurveda Aahar) ಎಂದು ಮಾರಾಟ ಮಾಡಲು FSSAI ನಿಯಮಗಳು 2022 ರ Regulation 3 ಅಡಿಯಲ್ಲಿ ಕೇಂದ್ರೀಯ ಪರವಾನಗಿ ಪಡೆಯಬೇಕು ಮತ್ತು Regulation 8 ರ ಅನ್ವಯ ಯಾವುದೇ ಚಿಕಿತ್ಸಕ ರೋಗ ಗುಣಪಡಿಸುವ ಕ್ಲೈಮ್‌ಗಳನ್ನು (disease cure claims) ಕಡ್ಡಾಯವಾಗಿ ತ್ಯಜಿಸಬೇಕು.`,
        why: `ಆಹಾರ ಸುರಕ್ಷತೆ ಮತ್ತು ಗುಣಮಟ್ಟ (ಆಯುರ್ವೇದ ಆಹಾರ) ನಿಯಮಗಳು 2022 ಆಹಾರ ಸೂತ್ರಗಳನ್ನು ಚಿಕಿತ್ಸಕ ಔಷಧಿಗಳಿಂದ ಕಟ್ಟುನಿಟ್ಟಾಗಿ ಪ್ರತ್ಯೇಕಿಸುತ್ತವೆ. ರೋಗ ಚಿಕಿತ್ಸೆಯ ಹಕ್ಕುಗಳು ಕೇವಲ D&C Act ಅಡಿಯಲ್ಲಿ ಪರವಾನಗಿ ಪಡೆದ ಆಯುಷ್ ಔಷಧಿಗಳಿಗೆ ಮಾತ್ರ ಸೀಮಿತ.`,
        evidence: [
          makeCitation('FSSAI_AYURVEDA_AAHAR_REG_3_8', 'ರೋಗ ಗುಣಪಡಿಸುವ ಕ್ಲೈಮ್‌ಗಳ ನಿಷೇಧ ಮತ್ತು ಲೋಗೋ ಮುದ್ರಣ ನಿಯಮಗಳು (Regulation 8).'),
        ],
        whatIsMissing: [
          'FoSCoS Category 13 ಅಡಿಯಲ್ಲಿ ಆಯುರ್ವೇದ ಆಹಾರ ಪರವಾನಗಿ ಅರ್ಜಿ ಮತ್ತು ಲೇಬಲ್ ವಿನ್ಯಾಸ ಪುರಾವೆ.',
        ],
        whatThisMeans: `ಆಯುರ್ವೇದ ಆಹಾರ ಉತ್ಪನ್ನದ ಮೇಲೆ ರೋಗ ವಾಸಿ ಮಾಡುವ ಹಕ್ಕುಗಳನ್ನು ಪ್ರದರ್ಶಿಸುವುದು ಆಹಾರ ಕಾಯಿದೆಯಡಿ ಅಪರಾಧವಾಗಿದ್ದು, ಉತ್ಪನ್ನ ಜಪ್ತಿ ಹಾಗೂ ದಂಡಕ್ಕೆ ಕಾರಣವಾಗುತ್ತದೆ.`,
        nextAction: [
          '1. ಪ್ಯಾಕೇಜಿಂಗ್‌ನಲ್ಲಿ ಕೇವಲ ಆರೋಗ್ಯ ಪೋಷಕ (wellness/dietary) ಕ್ಲೈಮ್‌ಗಳನ್ನು ಮಾತ್ರ ಬಳಸಿ.',
          '2. ಅಧಿಕೃತ ಆಯುರ್ವೇದ ಆಹಾರ ಲೋಗೋ ಮತ್ತು ಕಡ್ಡಾಯ ಎಚ್ಚರಿಕೆ ನಮೂದನ್ನು ಮುದ್ರಿಸಿ.',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Directly supported by FSS (Ayurveda Aahar) Regulations, 2022.',
        isAbstained: false,
      };
    }

    if (effectiveLang === 'hi') {
      return {
        answer: `यदि आप "${caseTitle}" को आयुर्वेद-आहार (Ayurveda Aahar) के रूप में विपणन करना चाहते हैं, तो FSSAI विनियम 2022 के Regulation 3 के तहत केंद्रीय लाइसेंस प्राप्त करना होगा और Regulation 8 के तहत पैकेजिंग पर किसी भी प्रकार के रोगोपचार या चिकित्सा दावों को पूर्णतः हटाना होगा।`,
        why: `खाद्य सुरक्षा और मानक (आयुर्वेद आहार) विनियम, 2022 पारंपरिक आहार योगों को औषधियों से स्पष्ट रूप से अलग करते हैं। रोग निवारण के दावे केवल D&C Act औषधियों हेतु आरक्षित हैं।`,
        evidence: [
          makeCitation('FSSAI_AYURVEDA_AAHAR_REG_3_8', 'रोगोपचार दावों का वैधानिक निषेध एवं अनिवार्य आयुर्वेद आहार लोगो (Regulation 8)।'),
        ],
        whatIsMissing: [
          'FoSCoS Category 13 लाइसेंस आवेदन और उत्पाद पैकेजिंग आर्टवर्क अनुमोदन।',
        ],
        whatThisMeans: `खाद्य उत्पाद पर उपचारात्मक दावे प्रदर्शित करना विनियामक उल्लंघन है, जिसके परिणामस्वरूप जब्ती व जुर्माना हो सकता है।`,
        nextAction: [
          '1. पैकेजिंग की समीक्षा कर केवल पोषण/कल्याण दावों को बनाए रखें।',
          '2. आधिकारिक आयुर्वेद आहार लोगो व अनिवार्य उपभोक्ता परामर्श अंकित करें।',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Directly supported by FSS (Ayurveda Aahar) Regulations, 2022.',
        isAbstained: false,
      };
    }

    return {
      answer: `If marketing "${caseTitle}" as an Ayurveda Aahar food product, you must obtain an FSSAI Central License under Regulation 3 and strictly omit all therapeutic disease cure claims on packaging per Regulation 8.`,
      why: `The Food Safety and Standards (Ayurveda Aahar) Regulations, 2022 strictly distinguish dietary Ayurvedic recipes from therapeutic medicines. Disease treatment claims are exclusively reserved for D&C Act licensed drugs.`,
      evidence: [
        makeCitation('FSSAI_AYURVEDA_AAHAR_REG_3_8', 'Prohibition of disease cure claims and mandatory logo placement.'),
      ],
      whatIsMissing: [
        'FoSCoS Category 13 license application and product packaging proof.',
      ],
      whatThisMeans: `Displaying therapeutic claims on an Ayurveda-Aahar food package is a direct regulatory violation subject to product seizure and misbranding penalties.`,
      nextAction: [
        '1. Audit product packaging to ensure only wellness/nutritional indications are claimed.',
        '2. Affix official Ayurveda Aahar logo and mandatory consumer advisory statement.',
      ],
      confidence: 'HIGH_EVIDENCE',
      confidenceExplanation: 'Directly supported by FSS (Ayurveda Aahar) Regulations, 2022.',
      isAbstained: false,
    };
  }

  // Topic 3: Regulations & AYUSH Licensing (Rule 158B)
  const isRegulationQuery =
    q.includes('regulation') ||
    q.includes('rule 158') ||
    q.includes('license') ||
    q.includes('ayush') ||
    q.includes('manufactur') ||
    q.includes('gmp') ||
    q.includes('ಲೈಸೆನ್ಸ್') ||
    q.includes('ನಿಯಮ') ||
    q.includes('உரிமம்') ||
    q.includes('లైసెన్స్');

  if (isRegulationQuery) {
    if (effectiveLang === 'kn') {
      return {
        answer: `"${caseTitle}" ಅನ್ನು ಭಾರತದಲ್ಲಿ ತಯಾರಿಸಲು ಮತ್ತು ಮಾರಾಟ ಮಾಡಲು ನೀವು ಔಷಧ ಮತ್ತು ಸೌಂದರ್ಯವರ್ಧಕ ನಿಯಮಗಳು, 1945 ರ Rule 158B ಅಡಿಯಲ್ಲಿ ರಾಜ್ಯ ಆಯುಷ್ ಪರವಾನಗಿ ಪ್ರಾಧಿಕಾರದಿಂದ (State AYUSH SLA) ಉತ್ಪಾದನಾ ಪರವಾನಗಿ ಮತ್ತು Schedule T GMP ಅನುಸರಣೆಯನ್ನು ಪಡೆಯಬೇಕು.`,
        why: `ಏಕೆಂದರೆ "${caseTitle}" ಶಾಸ್ತ್ರೀಯ ಪದಾರ್ಥಗಳನ್ನು ಹೊಂದಿರುವ ಸ್ವಾಮ್ಯದ ಆಯುರ್ವೇದ ಔಷಧಿಯಾಗಿದೆ (Ayurvedic Proprietary Medicine). Rule 158B ರ ಪ್ರಕಾರ ಶಾಸ್ತ್ರೀಯ ಗ್ರಂಥಗಳ ಉಲ್ಲೇಖ ಅಥವಾ ಪೈಲಟ್ ಸುರಕ್ಷತಾ ಡೇಟಾ ಅಗತ್ಯವಿದೆ.`,
        evidence: [
          makeCitation('DRUGS_COSMETICS_RULE_158B', 'ಆಯುರ್ವೇದ ಸ್ವಾಮ್ಯದ ಔಷಧಿಗಳ ಪರವಾನಗಿ ನಿಯಮಗಳು (Rule 158B).'),
          makeCitation('DRUGS_COSMETICS_SCHEDULE_T', 'ASU ಔಷಧಿಗಳ ಉತ್ತಮ ಉತ್ಪಾದನಾ ಅಭ್ಯಾಸಗಳು (Schedule T GMP).'),
        ],
        whatIsMissing: [
          'ಭಾರ ಲೋಹಗಳ (ಸೀಸ, ಆರ್ಸೆನಿಕ್, ಪಾದರಸ) ಪ್ರಯೋಗಾಲಯ ವಿಶ್ಲೇಷಣಾ ಪ್ರಮಾಣಪತ್ರ (CoA).',
          'ರಾಜ್ಯ ಆಯುಷ್ ಪ್ರಾಧಿಕಾರದಿಂದ Schedule T ಫ್ಯಾಕ್ಟರಿ ವಿನ್ಯಾಸ ಅನುಮೋದನೆ.',
        ],
        whatThisMeans: `ಆಯುಷ್ ಪರವಾನಗಿ ಮತ್ತು Schedule T GMP ಇಲ್ಲದೆ ವಾಣಿಜ್ಯ ಮಾರಾಟ ಮಾಡುವುದು ಔಷಧ ಮತ್ತು ಸೌಂದರ್ಯವರ್ಧಕ ಕಾಯಿದೆ, 1940 ರ Section 18 ರ ಅಡಿಯಲ್ಲಿ ಅಪರಾಧವಾಗಿದೆ.`,
        nextAction: [
          '1. API ಮೊನೊಗ್ರಾಫ್ ಪರೀಕ್ಷೆಯನ್ನು (ಭಾರ ಲೋಹಗಳು, ಕೀಟನಾಶಕಗಳು) ನಡೆಸಿ.',
          '2. Rule 158B Category A ಅಡಿಯಲ್ಲಿ ಬ್ಯಾಚ್ ಉತ್ಪಾದನಾ ದಾಖಲೆಗಳನ್ನು ಸಲ್ಲಿಸಿ.',
          '3. Schedule T ಮಾನದಂಡಗಳ ಪ್ರಕಾರ ಉತ್ಪಾದನಾ ಘಟಕವನ್ನು ಸಿದ್ಧಪಡಿಸಿ.',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Directly supported by D&C Act 1940 and Rule 158B notifications.',
        isAbstained: false,
      };
    }

    if (effectiveLang === 'hi') {
      return {
        answer: `"${caseTitle}" के निर्माण और व्यावसायिक विपणन हेतु आपको औषधि एवं प्रसाधन नियमावली, 1945 के Rule 158B के तहत राज्य आयुष लाइसेंसिंग प्राधिकरण (State AYUSH SLA) से विनिर्माण लाइसेंस और Schedule T GMP अनुपालन प्राप्त करना होगा।`,
        why: `चूंकि "${caseTitle}" एक आयुर्वेदिक प्रोप्रायटरी औषधि है, Rule 158B के अनुसार शास्त्रीय संदर्भ या प्रायोगिक सुरक्षा डेटा अनिवार्य है।`,
        evidence: [
          makeCitation('DRUGS_COSMETICS_RULE_158B', 'आयुर्वेदिक प्रोप्रायटरी औषधियों हेतु लाइसेंसिंग नियम (Rule 158B)।'),
          makeCitation('DRUGS_COSMETICS_SCHEDULE_T', 'एएसयू दवाओं हेतु गुड मैन्युफैक्चरिंग प्रैक्टिसेज (Schedule T GMP)।'),
        ],
        whatIsMissing: [
          'मान्यता प्राप्त प्रयोगशाला से भारी धातु (Heavy Metals) परीक्षण विश्लेषण प्रमाण पत्र (CoA)।',
          'राज्य आयुष प्राधिकरण से Schedule T फैक्ट्री लेआउट अनुमोदन।',
        ],
        whatThisMeans: `बिना आयुष SLA लाइसेंस और Schedule T GMP के व्यावसायिक बिक्री औषधि एवं प्रसाधन अधिनियम 1940 की Section 18 का उल्लंघन है।`,
        nextAction: [
          '1. एपीआई (API) मोनोग्राफ परीक्षण कराएं।',
          '2. Rule 158B Category A के तहत तकनीकी डोजियर तैयार करें।',
          '3. फैक्ट्री परिसर का Schedule T मानकों के अनुसार निरीक्षण कराएं।',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Directly supported by D&C Act 1940 and Rule 158B notifications.',
        isAbstained: false,
      };
    }

    return {
      answer: `To manufacture and market "${caseTitle}" in India, you must secure a manufacturing license from the State AYUSH Licensing Authority under Rule 158B of the Drugs and Cosmetics Rules, 1945, coupled with Schedule T GMP compliance.`,
      why: `Because "${caseTitle}" is an Ayurvedic Proprietary Medicine containing traditional ingredients in novel proportions, Rule 158B requires submission of textual citations or pilot clinical safety data.`,
      evidence: [
        makeCitation('DRUGS_COSMETICS_RULE_158B', 'Licensing rules for Ayurvedic Proprietary Medicines (Rule 158B).'),
        makeCitation('DRUGS_COSMETICS_SCHEDULE_T', 'Good Manufacturing Practices for ASU drugs (Schedule T GMP).'),
      ],
      whatIsMissing: [
        'Heavy metals (Lead, Arsenic, Cadmium, Mercury) laboratory Certificate of Analysis.',
        'Schedule T factory layout and sanitation approval from State AYUSH authority.',
      ],
      whatThisMeans: `Commercial sale without an AYUSH SLA license and Schedule T GMP certification violates Section 18 of the Drugs and Cosmetics Act, 1940.`,
      nextAction: [
        '1. Conduct API monograph compliance testing (heavy metals, aflatoxins, microbials).',
        '2. Compile batch manufacturing records and submission dossier under Rule 158B Category A.',
        '3. Inspect factory premises for Schedule T HVAC air handling and hygienic partition standards.',
      ],
      confidence: 'HIGH_EVIDENCE',
      confidenceExplanation: 'Directly supported by D&C Act 1940 and Rule 158B notifications.',
      isAbstained: false,
    };
  }

  // Topic 3: ABS & Biodiversity
  const isAbsQuery =
    q.includes('abs') ||
    q.includes('biodiversity') ||
    q.includes('nba') ||
    q.includes('sbb') ||
    q.includes('benefit sharing') ||
    q.includes('ಜೈವಿಕ ವೈವಿಧ್ಯ') ||
    q.includes('பல்லுயிர்') ||
    q.includes('జీవ వైవిధ్య');

  if (isAbsQuery) {
    if (effectiveLang === 'kn') {
      return {
        answer: `ಜೈವಿಕ ಗಿಡಮೂಲಿಕೆಗಳ (${ingNames}) ವಾಣಿಜ್ಯ ಬಳಕೆಗೆ ಜೈವಿಕ ವೈವಿಧ್ಯ ಕಾಯಿದೆ, 2002 ರ Section 7 ರ ಅಡಿಯಲ್ಲಿ ರಾಜ್ಯ ಜೈವಿಕ ವೈವಿಧ್ಯ ಮಂಡಳಿಗೆ (SBB) Form I ಪೂರ್ವ ಸೂಚನೆ ನೀಡುವುದು ಕಡ್ಡಾಯವಾಗಿದೆ. ಪೇಟೆಂಟ್ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದಾದರೆ Section 6 ರ ಪ್ರಕಾರ ರಾಷ್ಟ್ರೀಯ ಜೈವಿಕ ವೈವಿಧ್ಯ ಪ್ರಾಧಿಕಾರದಿಂದ (NBA) Form III ಅನುಮೋದನೆ ಪಡೆಯಬೇಕು.`,
        why: `ಭಾರತೀಯ ಜೈವಿಕ ಸಂಪನ್ಮೂಲಗಳನ್ನು ವಾಣಿಜ್ಯ ತಯಾರಿಕೆಗೆ ಬಳಸುವಾಗ ನ್ಯಾಯಯುತ ಮತ್ತು ಸಮಾನ ಪ್ರಯೋಜನ ಹಂಚಿಕೆಯನ್ನು (Access and Benefit Sharing) ಕಾಯಿದೆ ಕಡ್ಡಾಯಗೊಳಿಸುತ್ತದೆ.`,
        evidence: [
          makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'ಭಾರತೀಯ ವಾಣಿಜ್ಯ ಘಟಕಗಳಿಂದ SBB ಗೆ ಪೂರ್ವ ಸೂಚನೆ (Section 7).'),
          makeCitation('BIOLOGICAL_DIVERSITY_SEC_6', 'ಜೈವಿಕ ಸಂಪನ್ಮೂಲಗಳ ಮೇಲಿನ ಐಪಿಆರ್ ಅನುಮೋದನೆ (Section 6 NBA Form III).'),
        ],
        whatIsMissing: [
          'ಗಿಡಮೂಲಿಕೆಗಳನ್ನು ನೋಂದಾಯಿತ ರೈತರಿಂದ ಬೆಳೆಸಲಾಗಿದೆಯೇ ಅಥವಾ ಕಾಡಿನಿಂದ ಸಂಗ್ರಹಿಸಲಾಗಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸುವ ರಶೀದಿಗಳು.',
        ],
        whatThisMeans: `ರಾಜ್ಯ ಜೈವಿಕ ವೈವಿಧ್ಯ ಮಂಡಳಿಗೆ ಸೂಚಿಸಲು ವಿಫಲವಾದ ವಾಣಿಜ್ಯ ಘಟಕಗಳು Section 55 ರ ಅಡಿಯಲ್ಲಿ ಶಾಸನಬದ್ಧ ದಂಡವನ್ನು ಎದುರಿಸಬೇಕಾಗುತ್ತದೆ. ಕೃಷಿ ಮಾಡಿದ ಗಿಡಮೂಲಿಕೆಗಳು ರಿಯಾಯಿತಿ ಪ್ರಯೋಜನ ಹಂಚಿಕೆ ದರಗಳಿಗೆ (0.1% ರಿಂದ 0.5%) ಅರ್ಹವಾಗಿವೆ.`,
        nextAction: [
          '1. ಮೂಲ ರಾಜ್ಯದ ಜೈವಿಕ ವೈವಿಧ್ಯ ಮಂಡಳಿಗೆ Form I ಸಲ್ಲಿಸಿ.',
          '2. ಕೃಷಿ ಸ್ಥಿತಿಯನ್ನು ಸಾಬೀತುಪಡಿಸಲು ಬೆಳೆಗಾರರ ಘೋಷಣೆಗಳು ಮತ್ತು ಮಂಡಿ ತೆರಿಗೆ ರಶೀದಿಗಳನ್ನು ಪಡೆಯಿರಿ.',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Directly supported by Sections 6 and 7 of the Biological Diversity Act, 2002.',
        isAbstained: false,
      };
    }

    if (effectiveLang === 'hi') {
      return {
        answer: `जैविक जड़ी-बूटियों (${ingNames}) के व्यावसायिक उपयोग हेतु जैविक विविधता अधिनियम, 2002 की Section 7 के तहत राज्य जैव विविधता बोर्ड (SBB) को Form I पूर्व सूचना देना अनिवार्य है। यदि पेटेंट आवेदन कर रहे हैं, तो Section 6 के तहत राष्ट्रीय जैव विविधता प्राधिकरण (NBA) से Form III अनुमोदन प्राप्त करना होगा।`,
        why: `जैविक विविधता अधिनियम भारतीय जैविक संसाधनों के व्यावसायिक उपयोग पर न्यायसंगत और समान लाभ साझाकरण (Access and Benefit Sharing) अनिवार्य करता है।`,
        evidence: [
          makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'भारतीय व्यावसायिक संस्थाओं द्वारा SBB को पूर्व सूचना (Section 7)।'),
          makeCitation('BIOLOGICAL_DIVERSITY_SEC_6', 'भारतीय जैव संसाधनों पर पेटेंट अनुदान पूर्व NBA अनुमोदन (Section 6 NBA Form III)।'),
        ],
        whatIsMissing: [
          'जड़ी-बूटियों की खेती या जंगली संग्रह के स्रोत को प्रमाणित करने वाले खरीद बिल व मंडी रसीदें।',
        ],
        whatThisMeans: `राज्य जैव विविधता बोर्ड को पूर्व सूचना न देने पर Section 55 के तहत वैधानिक दंड का प्रावधान है। किसान-उत्पादित जड़ी-बूटियों पर रियायती दरें (0.1% से 0.5%) लागू होती हैं।`,
        nextAction: [
          '1. संबंधित राज्य के जैव विविधता बोर्ड को Form I प्रस्तुत करें।',
          '2. कृषि स्रोत प्रमाणित करने हेतु मंडी रसीदें व किसान घोषणापत्र संकलित करें।',
          '3. पेटेंट फाइलिंग से पूर्व NBA Form III की प्रक्रिया प्रारंभ करें।',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Directly supported by Sections 6 and 7 of the Biological Diversity Act, 2002.',
        isAbstained: false,
      };
    }

    if (effectiveLang === 'ta') {
      return {
        answer: `உயிரியல் மூலிகைகளின் (${ingNames}) வணிகப் பயன்பாட்டிற்கு பல்லுயிர் சட்டம் 2002 இன் Section 7 இன் கீழ் மாநில பல்லுயிர் வாரியத்திற்கு (SBB) Form I மூலம் முன் அறிவிப்பு சமர்ப்பிப்பது கட்டாயமாகும். காப்புரிமை கோரினால் Section 6 இன் கீழ் தேசிய பல்லுயிர் ஆணையத்திடம் (NBA) Form III ஒப்புதல் பெற வேண்டும்.`,
        why: `இந்திய உயிரியல் வளங்களை வணிக ரீதியாக பயன்படுத்தும்போது நியாயமான மற்றும் சமமான பயன் பகிர்வை (Access and Benefit Sharing) சட்டம் கட்டாயமாக்குகிறது.`,
        evidence: [
          makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'SBB க்கு முன் தகவல் அளித்தல் (Section 7).'),
          makeCitation('BIOLOGICAL_DIVERSITY_SEC_6', 'காப்புரிமைக்கு முன் NBA ஒப்புதல் (Section 6 Form III).'),
        ],
        whatIsMissing: ['மூலிகைகள் சாகுபடி செய்யப்பட்டதா அல்லது காடுகளிலிருந்து சேகரிக்கப்பட்டதா என்பதற்கான கொள்முதல் ரசீதுகள்.'],
        whatThisMeans: `மாநில பல்லுயிர் வாரியத்திற்கு அறிவிக்கத் தவறினால் Section 55 இன் கீழ் சட்டரீதியான அபராதம் விதிக்கப்படும்.`,
        nextAction: [
          '1. சம்பந்தப்பட்ட மாநில பல்லுயிர் வாரியத்திடம் Form I சமர்ப்பிக்கவும்.',
          '2. சாகுபடி நிலைக்கான ஆவணங்களை திரட்டவும்.',
        ],
        confidence: 'HIGH_EVIDENCE',
        confidenceExplanation: 'Directly supported by Sections 6 and 7 of the Biological Diversity Act, 2002.',
        isAbstained: false,
      };
    }

    return {
      answer: `Commercial utilization of biological herbs (${ingNames}) requires filing Form I Prior Intimation with the State Biodiversity Board (SBB) under Section 7 of the Biological Diversity Act, 2002. If filing a patent, NBA Form III approval is mandatory under Section 6.`,
      why: `The Biological Diversity Act mandates fair and equitable benefit sharing when Indian biological resources are accessed for commercial manufacturing. Indian commercial companies are strictly subject to SBB intimation.`,
      evidence: [
        makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'Prior intimation to SBB by Indian commercial entities (Section 7).'),
        makeCitation('BIOLOGICAL_DIVERSITY_SEC_6', 'NBA approval prior to IPR grant based on Indian bio-resources (Section 6 Form III).'),
      ],
      whatIsMissing: [
        'Traceability invoices confirming whether herbs were cultivated by registered farmers or forest wild-harvested.',
      ],
      whatThisMeans: `Commercial entities that fail to intimate the State Biodiversity Board face statutory penalties under Section 55 of the Act. Cultivated herbs qualify for reduced benefit-sharing fee schedules (0.1% to 0.5% ex-factory value).`,
      nextAction: [
        '1. Submit Form I to the State Biodiversity Board of the procurement state.',
        '2. Secure grower declarations and Mandi tax receipts to prove cultivated status.',
      ],
      confidence: 'HIGH_EVIDENCE',
      confidenceExplanation: 'Directly supported by Sections 6 and 7 of the Biological Diversity Act, 2002.',
      isAbstained: false,
    };
  }



  // Default: General decision-support synthesis
  if (effectiveLang === 'kn') {
    return {
      answer: `"${caseTitle}" ಗಾಗಿ ಸಮಗ್ರ ಕಾರ್ಯತಂತ್ರ ಶಿಫಾರಸು: (1) ಪೇಟೆಂಟ್ ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು Section 3(p) ಸಿನರ್ಜಿ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ, (2) Rule 158B ಅಡಿಯಲ್ಲಿ ಆಯುರ್ವೇದ ಸ್ವಾಮ್ಯದ ಪರವಾನಗಿ ಪಡೆಯಿರಿ, ಮತ್ತು (3) ಗಿಡಮೂಲಿಕೆಗಳ ವಾಣಿಜ್ಯ ಬಳಕೆಗಾಗಿ SBB Form I ಸಲ್ಲಿಸಿ.`,
      why: `${ingNames} ಹೊಂದಿರುವ ಗಿಡಮೂಲಿಕೆಗಳ ಸೂತ್ರೀಕರಣವು ಔಷಧ ನಿಯಮಗಳು ಮತ್ತು ಪೇಟೆಂಟ್ ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನದ ಗಡಿಗಳೆರಡರಲ್ಲೂ ಬರುತ್ತದೆ.`,
      evidence: [
        makeCitation('PATENTS_ACT_SEC_3P', 'ಪೇಟೆಂಟ್ ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ ಮಿತಿ (Section 3(p)).'),
        makeCitation('DRUGS_COSMETICS_RULE_158B', 'ಆಯುರ್ವೇದ ಸ್ವಾಮ್ಯದ ಔಷಧ ಪರವಾನಗಿ (Rule 158B).'),
        makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'SBB ವಾಣಿಜ್ಯ ಪ್ರವೇಶ ಸೂಚನೆ (Section 7).'),
      ],
      whatIsMissing: [
        'ಸಿದ್ಧ ಉತ್ಪನ್ನದ ಭಾರ ಲೋಹ ಪರೀಕ್ಷಾ ವಿಶ್ಲೇಷಣಾ ವರದಿ.',
        'ಪದಾರ್ಥಗಳ ಅನುಪಾತಗಳು ಮತ್ತು ಬ್ಯಾಚ್ ದಾಖಲೆಗಳು.',
      ],
      whatThisMeans: `ದ್ವಿಮುಖ ಕಾರ್ಯತಂತ್ರವು ಟ್ರೇಡ್‌ಮಾರ್ಕ್ ಮೂಲಕ ಬ್ರ್ಯಾಂಡ್ ಮೌಲ್ಯವನ್ನು ರಕ್ಷಿಸಲು ಮತ್ತು ಸಮಾನಾಂತರವಾಗಿ ಆಯುಷ್ ಉತ್ಪಾದನಾ ಪರವಾನಗಿಯನ್ನು ಪಡೆಯಲು ಅನುವು ಮಾಡಿಕೊಡುತ್ತದೆ.`,
      nextAction: [
        '1. ರಾಜ್ಯ ಜೈವಿಕ ವೈವಿಧ್ಯ ಮಂಡಳಿಗೆ Form I ಸಲ್ಲಿಸಿ.',
        '2. Class 5 ರಲ್ಲಿ ಟ್ರೇಡ್‌ಮಾರ್ಕ್ ನೋಂದಣಿ ಮಾಡಿ.',
        '3. ರಾಜ್ಯ ಆಯುಷ್ ಪರವಾನಗಿ ಪ್ರಾಧಿಕಾರಕ್ಕಾಗಿ Rule 158B ದಾಖಲೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ.',
      ],
      confidence: 'HIGH_EVIDENCE',
      confidenceExplanation: 'Grounded in active statutory provisions from Patents Act 1970, D&C Act 1940, and BDA 2002.',
      isAbstained: false,
    };
  }

  if (effectiveLang === 'hi') {
    return {
      answer: `"${caseTitle}" हेतु समग्र कार्यनीति: (1) पेटेंट आवेदन से पूर्व Section 3(p) सहक्रियाशीलता मूल्यांकन करें, (2) Rule 158B के तहत आयुष प्रोप्रायटरी लाइसेंस प्राप्त करें, और (3) जड़ी-बूटियों के व्यावसायिक उपयोग हेतु SBB Form I दाखिल करें।`,
      why: `${ingNames} युक्त यह पॉलीहर्बल फॉर्मूलेशन औषधि नियमावली एवं पेटेंट पारंपरिक ज्ञान दोनों के विधिक दायरे में आता है।`,
      evidence: [
        makeCitation('PATENTS_ACT_SEC_3P', 'पेटेंट पारंपरिक ज्ञान सीमा (Section 3(p))।'),
        makeCitation('DRUGS_COSMETICS_RULE_158B', 'आयुर्वेदिक प्रोप्रायटरी औषधि लाइसेंसिंग (Rule 158B)।'),
        makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'SBB व्यावसायिक प्रवेश पूर्व सूचना (Section 7)।'),
      ],
      whatIsMissing: [
        'अंतिम उत्पाद का भारी धातु व सूक्ष्मजीव विश्लेषणात्मक CoA।',
        'घटकों के अनुपात व बैच विनिर्माण प्रलेख।',
      ],
      whatThisMeans: `दोहरी कार्यनीति आपको Class 5 में ट्रेडमार्क द्वारा ब्रांड मूल्य सुरक्षित करने और समानांतर रूप से आयुष लाइसेंस प्राप्त करने में सक्षम बनाती है।`,
      nextAction: [
        '1. राज्य जैव विविधता बोर्ड को Form I प्रस्तुत करें।',
        '2. Class 5 में ट्रेडमार्क पंजीकरण आवेदन करें।',
        '3. राज्य आयुष SLA हेतु Rule 158B तकनीकी डोजियर तैयार करें।',
      ],
      confidence: 'HIGH_EVIDENCE',
      confidenceExplanation: 'Grounded in active statutory provisions from Patents Act 1970, D&C Act 1940, and BDA 2002.',
      isAbstained: false,
    };
  }

  return {
    answer: `For "${caseTitle}", an integrated strategy is recommended: (1) Evaluate Section 3(p) synergy before filing patents, (2) Seek proprietary ASU licensing under Rule 158B, and (3) File SBB Form I for commercial herbal utilization.`,
    why: `Polyherbal formulations containing ${ingNames} intersect both the Drugs & Cosmetics regulatory framework and the Patents Act traditional knowledge boundary.`,
    evidence: [
      makeCitation('PATENTS_ACT_SEC_3P', 'Patent traditional knowledge threshold (Section 3(p)).'),
      makeCitation('DRUGS_COSMETICS_RULE_158B', 'Ayurvedic proprietary medicine licensing (Rule 158B).'),
      makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'SBB commercial access intimation (Section 7).'),
    ],
    whatIsMissing: [
      'Finished product analytical CoA verifying heavy metal limits.',
      'Documented extraction solvent ratios and batch records.',
    ],
    whatThisMeans: `A dual pathway strategy allows you to protect commercial brand equity via trademark while securing an AYUSH manufacturing license in parallel.`,
    nextAction: [
      '1. File Form I with State Biodiversity Board.',
      '2. Register trademark in Class 5.',
      '3. Assemble Rule 158B dossier for State AYUSH Licensing Authority.',
    ],
    confidence: 'HIGH_EVIDENCE',
    confidenceExplanation: 'Grounded in active statutory provisions from Patents Act 1970, D&C Act 1940, and BDA 2002.',
    isAbstained: false,
  };
}
