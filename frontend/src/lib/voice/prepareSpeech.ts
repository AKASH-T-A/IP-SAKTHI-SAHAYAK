/**
 * IP-SAKTI Sahayak — Speech Text Preparation & Normalization
 * SIH26045
 * 
 * Prepares text for Text-to-Speech (TTS) synthesis across all 22 Scheduled
 * Indian Languages + English.
 * 
 * CORE RULES:
 * 1. VISUAL text remains 100% canonical (Section 3(p), Patents Act 1970, Form III, Rule 158B).
 * 2. AUDIO text is specifically transformed for natural pronunciation in the selected language.
 * 3. Numbers and dates are converted to native script numerals/words so Indic TTS engines
 *    pronounce them in the selected Indian language rather than switching to English.
 * 4. English UI structural markers (Evidence, Limitations, Next Steps) are translated for speech.
 * 5. Botanical scientific names (Withania somnifera, Bacopa monnieri, etc.) are protected.
 * 6. Strips markdown syntax, technical symbols, citation markup [1], [2], URLs, and UI decoration.
 */

import { LanguageCode } from '@/i18n/languages';

// Botanical / Scientific names that must be preserved intact for speech
const BOTANICAL_NAMES = [
  'Withania somnifera', 'Ashwagandha',
  'Bacopa monnieri', 'Brahmi',
  'Curcuma longa', 'Haridra',
  'Azadirachta indica', 'Neem', 'Nimba',
  'Ocimum sanctum', 'Tulasi',
  'Zingiber officinale', 'Sunthi',
  'Terminalia arjuna', 'Arjuna',
  'Terminalia chebula', 'Haritaki',
  'Emblica officinalis', 'Amalaki',
  'Tinospora cordifolia', 'Guduchi',
  'Commiphora mukul', 'Guggulu',
];

// Spoken mapping for legal and statutory identifiers across major Indian language families
const SPOKEN_LEGAL_MAP: Record<string, [RegExp, string][]> = {
  kn: [
    [/Section\s+3\(p\)/gi, 'ಸೆಕ್ಷನ್ ೩(ಪಿ)'],
    [/Section\s+3\(e\)/gi, 'ಸೆಕ್ಷನ್ ೩(ಇ)'],
    [/Section\s+3\(d\)/gi, 'ಸೆಕ್ಷನ್ ೩(ಡಿ)'],
    [/Section\s+10\(4\)\(ii\)\(D\)/gi, 'ಸೆಕ್ಷನ್ ೧೦(೪)(೨)(ಡಿ)'],
    [/Section\s+3/gi, 'ಸೆಕ್ಷನ್ ೩'],
    [/Section\s+(\d+)/gi, 'ಸೆಕ್ಷನ್ $1'],
    [/§\s*3\(p\)/gi, 'ಸೆಕ್ಷನ್ ೩(ಪಿ)'],
    [/§\s*3\(e\)/gi, 'ಸೆಕ್ಷನ್ ೩(ಇ)'],
    [/§\s*10\(4\)\(ii\)\(D\)/gi, 'ಸೆಕ್ಷನ್ ೧೦(೪)(೨)(ಡಿ)'],
    [/§\s*(\d+)/gi, 'ಸೆಕ್ಷನ್ $1'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'ಪೇಟೆಂಟ್ಸ್ ಕಾಯಿದೆ ೧೯೭೦'],
    [/Patents\s+Act/gi, 'ಪೇಟೆಂಟ್ಸ್ ಕಾಯಿದೆ'],
    [/Biological\s+Diversity\s+Act(?:\s*,\s*|\s+)2002/gi, 'ಜೈವಿಕ ವೈವಿಧ್ಯ ಕಾಯಿದೆ ೨೦೦೨'],
    [/Drugs\s+(?:and|&)\s+Cosmetics\s+Act(?:\s*,\s*|\s+)1940/gi, 'ಔಷಧ ಮತ್ತು ಸೌಂದರ್ಯವರ್ಧಕ ಕಾಯಿದೆ ೧೯೪೦'],
    [/Drugs\s+(?:and|&)\s+Cosmetics\s+Rules(?:\s*,\s*|\s+)1945/gi, 'ಔಷಧ ಮತ್ತು ಸೌಂದರ್ಯವರ್ಧಕ ನಿಯಮಗಳು ೧೯೪೫'],
    [/Drugs\s+(?:and|&)\s+Magic\s+Remedies\s+Act(?:\s*,\s*|\s+)1954/gi, 'ಔಷಧ ಮತ್ತು ಮಾಂತ್ರಿಕ ಪರಿಹಾರ ಕಾಯಿದೆ ೧೯೫೪'],
    [/Rule\s+158B/gi, 'ರೂಲ್ ೧೫೮ ಬಿ'],
    [/Rule\s+(\d+)[A-Z]?/gi, 'ರೂಲ್ $1'],
    [/Form\s+III/gi, 'ಫಾರ್ಮ್ ೩'],
    [/Form\s+3/gi, 'ಫಾರ್ಮ್ ೩'],
    [/Form\s+1/gi, 'ಫಾರ್ಮ್ ೧'],
    [/Form\s+([IVX0-9]+)/gi, 'ಫಾರ್ಮ್ $1'],
    [/Schedule\s+1/gi, 'ಅನುಸೂಚಿ ೧'],
    [/Schedule\s+T/gi, 'ಅನುಸೂಚಿ ಟಿ'],
    [/Schedule\s+([A-Z0-9]+)/gi, 'ಅನುಸೂಚಿ $1'],
    [/NBA\s+Form\s+III/gi, 'ಎನ್ ಬಿ ಎ ಫಾರ್ಮ್ ೩'],
    [/\bNBA\b/g, 'ಎನ್ ಬಿ ಎ'],
    [/\bSBB\b/g, 'ಎಸ್ ಬಿ ಬಿ'],
    [/\bAYUSH\b/g, 'ಆಯುಷ್'],
    [/\bFSSAI\b/g, 'ಎಫ್ ಎಸ್ ಎಸ್ ಎ ಐ'],
    [/\bTKDL\b/g, 'ಟಿಕೆಡಿಎಲ್'],
  ],
  hi: [
    [/Section\s+3\(p\)/gi, 'धारा ३(पी)'],
    [/Section\s+3\(e\)/gi, 'धारा ३(ई)'],
    [/Section\s+3\(d\)/gi, 'धारा ३(डी)'],
    [/Section\s+10\(4\)\(ii\)\(D\)/gi, 'धारा १०(४)(२)(डी)'],
    [/Section\s+3/gi, 'धारा ३'],
    [/Section\s+(\d+)/gi, 'धारा $1'],
    [/§\s*3\(p\)/gi, 'धारा ३(पी)'],
    [/§\s*3\(e\)/gi, 'धारा ३(ई)'],
    [/§\s*(\d+)/gi, 'धारा $1'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'पेटेंट अधिनियम १९७०'],
    [/Patents\s+Act/gi, 'पेटेंट अधिनियम'],
    [/Biological\s+Diversity\s+Act(?:\s*,\s*|\s+)2002/gi, 'जैव विविधता अधिनियम २००२'],
    [/Drugs\s+(?:and|&)\s+Cosmetics\s+Act(?:\s*,\s*|\s+)1940/gi, 'औषधि एवं प्रसाधन अधिनियम १९४०'],
    [/Drugs\s+(?:and|&)\s+Cosmetics\s+Rules(?:\s*,\s*|\s+)1945/gi, 'औषधि एवं प्रसाधन नियमावली १९४५'],
    [/Drugs\s+(?:and|&)\s+Magic\s+Remedies\s+Act(?:\s*,\s*|\s+)1954/gi, 'औषधि एवं चमत्कारी उपचार अधिनियम १९५४'],
    [/Rule\s+158B/gi, 'नियम १५८ बी'],
    [/Rule\s+(\d+)[A-Z]?/gi, 'नियम $1'],
    [/Form\s+III/gi, 'फॉर्म ३'],
    [/Form\s+3/gi, 'फॉर्म ३'],
    [/Form\s+1/gi, 'फॉर्म १'],
    [/Schedule\s+1/gi, 'अनुसूची १'],
    [/Schedule\s+T/gi, 'अनुसूची टी'],
    [/NBA\s+Form\s+III/gi, 'एन बी ए फॉर्म ३'],
    [/\bNBA\b/g, 'एन बी ए'],
    [/\bSBB\b/g, 'एस बी बी'],
    [/\bAYUSH\b/g, 'आयुष'],
    [/\bFSSAI\b/g, 'एफ एस एस ए आई'],
    [/\bTKDL\b/g, 'टीकेडीएल'],
  ],
  ta: [
    [/Section\s+3\(p\)/gi, 'பிரிவு 3(பி)'],
    [/Section\s+3\(e\)/gi, 'பிரிவு 3(இ)'],
    [/Section\s+10\(4\)\(ii\)\(D\)/gi, 'பிரிவு 10(4)(2)(டி)'],
    [/Section\s+(\d+)/gi, 'பிரிவு $1'],
    [/§\s*3\(p\)/gi, 'பிரிவு 3(பி)'],
    [/§\s*(\d+)/gi, 'பிரிவு $1'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'காப்புரிமை சட்டம் 1970'],
    [/Patents\s+Act/gi, 'காப்புரிமை சட்டம்'],
    [/Biological\s+Diversity\s+Act(?:\s*,\s*|\s+)2002/gi, 'பல்லுயிர் சட்டம் 2002'],
    [/Rule\s+158B/gi, 'விதி 158 பி'],
    [/Form\s+III/gi, 'படிவம் 3'],
    [/Schedule\s+1/gi, 'அட்டவணை 1'],
    [/Schedule\s+T/gi, 'அட்டவணை டி'],
    [/\bNBA\b/g, 'என் பி ஏ'],
    [/\bAYUSH\b/g, 'ஆயுஷ்'],
  ],
  te: [
    [/Section\s+3\(p\)/gi, 'సెక్షన్ 3(పి)'],
    [/Section\s+3\(e\)/gi, 'సెక్షన్ 3(ఇ)'],
    [/Section\s+(\d+)/gi, 'సెక్షన్ $1'],
    [/§\s*3\(p\)/gi, 'సెక్షన్ 3(పి)'],
    [/§\s*(\d+)/gi, 'సెక్షన్ $1'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'పేటెంట్ చట్టం 1970'],
    [/Rule\s+158B/gi, 'రూల్ 158 బి'],
    [/Form\s+III/gi, 'ఫారం 3'],
    [/Schedule\s+1/gi, 'షెడ్యూల్ 1'],
    [/\bNBA\b/g, 'ఎన్ బి ఎ'],
    [/\bAYUSH\b/g, 'ఆయుష్'],
  ],
  ml: [
    [/Section\s+3\(p\)/gi, 'വകുപ്പ് 3(പി)'],
    [/Section\s+3\(e\)/gi, 'വകുപ്പ് 3(ഇ)'],
    [/Section\s+(\d+)/gi, 'വകുപ്പ് $1'],
    [/§\s*3\(p\)/gi, 'വകുപ്പ് 3(പി)'],
    [/§\s*(\d+)/gi, 'വകുപ്പ് $1'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'പേറ്റന്റ് ആക്റ്റ് 1970'],
    [/Rule\s+158B/gi, 'റൂൾ 158 ബി'],
    [/Form\s+III/gi, 'ഫോം 3'],
    [/\bNBA\b/g, 'എൻ ബി എ'],
    [/\bAYUSH\b/g, 'ആയുഷ്'],
  ],
  bn: [
    [/Section\s+3\(p\)/gi, 'ধারা ৩(পি)'],
    [/Section\s+3\(e\)/gi, 'ধারা ৩(ই)'],
    [/Section\s+(\d+)/gi, 'ধারা $1'],
    [/§\s*3\(p\)/gi, 'ধারা ৩(পি)'],
    [/§\s*(\d+)/gi, 'ধারা $1'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'পেটেন্ট আইন ১৯৭০'],
    [/Rule\s+158B/gi, 'রুল ১৫৮ বি'],
    [/Form\s+III/gi, 'ফর্ম ৩'],
    [/\bNBA\b/g, 'এন বি এ'],
    [/\bAYUSH\b/g, 'আয়ুষ'],
  ],
  mr: [
    [/Section\s+3\(p\)/gi, 'कलम ३(पी)'],
    [/Section\s+3\(e\)/gi, 'कलम ३(ई)'],
    [/Section\s+(\d+)/gi, 'कलम $1'],
    [/§\s*3\(p\)/gi, 'कलम ३(पी)'],
    [/§\s*(\d+)/gi, 'कलम $1'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'पेटंट कायदा १९७०'],
    [/Rule\s+158B/gi, 'नियम १५८ बी'],
    [/Form\s+III/gi, 'फॉर्म ३'],
    [/\bNBA\b/g, 'एन बी ए'],
    [/\bAYUSH\b/g, 'आयुष'],
  ],
  gu: [
    [/Section\s+3\(p\)/gi, 'કલમ ૩(પી)'],
    [/Section\s+3\(e\)/gi, 'કલમ ૩(ઇ)'],
    [/Section\s+(\d+)/gi, 'કલમ $1'],
    [/§\s*3\(p\)/gi, 'કલમ ૩(પી)'],
    [/§\s*(\d+)/gi, 'કલમ $1'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'પેટન્ટ કાયદો ૧૯૭૦'],
    [/Rule\s+158B/gi, 'નિયમ ૧૫૮ બી'],
    [/Form\s+III/gi, 'ફોર્મ ૩'],
    [/\bNBA\b/g, 'એન બી એ'],
    [/\bAYUSH\b/g, 'આયુષ'],
  ],
  ur: [
    [/Section\s+3\(p\)/gi, 'دفعہ ۳(پی)'],
    [/Section\s+3\(e\)/gi, 'دفعہ ۳(ای)'],
    [/Section\s+(\d+)/gi, 'دفعہ $1'],
    [/§\s*3\(p\)/gi, 'دفعہ ۳(پی)'],
    [/§\s*(\d+)/gi, 'دفعہ $1'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'پیٹنٹ ایکٹ ۱۹۷۰'],
    [/Rule\s+158B/gi, 'رول ۱۵۸ بی'],
    [/Form\s+III/gi, 'فارم ۳'],
    [/\bNBA\b/g, 'این بی اے'],
    [/\bAYUSH\b/g, 'آیوش'],
  ],
};

// Indic script numeral mappings to convert ASCII digits for native TTS engines
const DIGIT_MAPS: Record<string, string[]> = {
  kn: ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'],
  hi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  mr: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  sa: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  kok: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  mai: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  doi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  ne: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  brx: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  bn: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
  as: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
  mni: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
  gu: ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'],
  pa: ['੦', '੧', '੨', '੩', '੪', '੫', '੬', '੭', '੮', '੯'],
  or: ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯'],
  te: ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯'],
  ur: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  ks: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
  sd: ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'],
};

// Structural English words that can be converted to localized spoken words
const STRUCTURAL_WORDS_MAP: Record<string, [RegExp, string][]> = {
  kn: [
    [/^Direct Answer:\s*/gi, 'ನೇರ ಉತ್ತರ: '],
    [/^Answer:\s*/gi, 'ಉತ್ತರ: '],
    [/^Statutory Evidence:\s*/gi, 'ಶಾಸನಬದ್ಧ ಸಾಕ್ಷ್ಯ: '],
    [/^Evidence:\s*/gi, 'ಸಾಕ್ಷ್ಯಾಧಾರ: '],
    [/^Important Limitations:\s*/gi, 'ಮುಖ್ಯ ಮಿತಿಗಳು: '],
    [/^Limitations:\s*/gi, 'ಮಿತಿಗಳು: '],
    [/^Recommended Next Actions:\s*/gi, 'ಮುಂದಿನ ಕ್ರಮಗಳು: '],
    [/^Next Steps:\s*/gi, 'ಮುಂದಿನ ಕ್ರಮಗಳು: '],
    [/Why This Applies:\s*/gi, 'ಇದು ಏಕೆ ಅನ್ವಯಿಸುತ್ತದೆ: '],
  ],
  hi: [
    [/^Direct Answer:\s*/gi, 'सीधा उत्तर: '],
    [/^Answer:\s*/gi, 'उत्तर: '],
    [/^Statutory Evidence:\s*/gi, 'सांविधिक साक्ष्य: '],
    [/^Evidence:\s*/gi, 'साक्ष्य: '],
    [/^Important Limitations:\s*/gi, 'महत्वपूर्ण सीमाएं: '],
    [/^Limitations:\s*/gi, 'सीमाएं: '],
    [/^Recommended Next Actions:\s*/gi, 'अनुशंसित अगले कदम: '],
    [/^Next Steps:\s*/gi, 'अगले कदम: '],
  ],
  ta: [
    [/^Direct Answer:\s*/gi, 'நேரடி பதில்: '],
    [/^Answer:\s*/gi, 'பதில்: '],
    [/^Evidence:\s*/gi, 'ஆதாரம்: '],
    [/^Limitations:\s*/gi, 'வரம்புகள்: '],
    [/^Next Steps:\s*/gi, 'அடுத்த படிகள்: '],
  ],
  te: [
    [/^Direct Answer:\s*/gi, 'ప్రత్యక్ష సమాధానం: '],
    [/^Answer:\s*/gi, 'సమాధానం: '],
    [/^Evidence:\s*/gi, 'సాక్ష్యం: '],
    [/^Limitations:\s*/gi, 'పరిమితులు: '],
    [/^Next Steps:\s*/gi, 'తదుపరి చర్యలు: '],
  ],
  ml: [
    [/^Direct Answer:\s*/gi, 'നേരിട്ടുള്ള ഉത്തരം: '],
    [/^Answer:\s*/gi, 'ഉത്തരം: '],
    [/^Evidence:\s*/gi, 'തെളിവ്: '],
    [/^Limitations:\s*/gi, 'പരിമിതികൾ: '],
    [/^Next Steps:\s*/gi, 'അടുത്ത ഘട്ടങ്ങൾ: '],
  ],
  mr: [
    [/^Direct Answer:\s*/gi, 'थेट उत्तर: '],
    [/^Answer:\s*/gi, 'उत्तर: '],
    [/^Evidence:\s*/gi, 'पुरावा: '],
    [/^Limitations:\s*/gi, 'मर्यादा: '],
    [/^Next Steps:\s*/gi, 'पुढील पावले: '],
  ],
  bn: [
    [/^Direct Answer:\s*/gi, 'সরাসরি উত্তর: '],
    [/^Answer:\s*/gi, 'উত্তর: '],
    [/^Evidence:\s*/gi, 'প্রমাণ: '],
    [/^Limitations:\s*/gi, 'সীমাবদ্ধতা: '],
    [/^Next Steps:\s*/gi, 'পরবর্তী পদক্ষেপ: '],
  ],
  gu: [
    [/^Direct Answer:\s*/gi, 'સીધો જવાબ: '],
    [/^Answer:\s*/gi, 'જવાબ: '],
    [/^Evidence:\s*/gi, 'પુરાવા: '],
    [/^Limitations:\s*/gi, 'મર્યાદાઓ: '],
    [/^Next Steps:\s*/gi, 'આગલા પગલાં: '],
  ],
  ur: [
    [/^Direct Answer:\s*/gi, 'براہ راست جواب: '],
    [/^Answer:\s*/gi, 'جواب: '],
    [/^Evidence:\s*/gi, 'ثبوت: '],
    [/^Limitations:\s*/gi, 'حدود: '],
    [/^Next Steps:\s*/gi, 'اگلے اقدامات: '],
  ],
};

/**
 * Prepares and normalizes text for speech synthesis in the given language.
 */
export function prepareTextForSpeech(text: string, language: LanguageCode): string {
  if (!text || typeof text !== 'string') return '';

  let prepared = text.trim();

  // 1. Remove URLs (http://, https://, www.)
  prepared = prepared.replace(/https?:\/\/\S+/gi, '');
  prepared = prepared.replace(/www\.\S+/gi, '');

  // 2. Remove citation references like [1], [2], [Citation 3], (Source: Gazette...)
  prepared = prepared.replace(/\[\s*\d+\s*\]/g, '');
  prepared = prepared.replace(/\[\s*Citation\s*\d+\s*\]/gi, '');
  prepared = prepared.replace(/\(\s*Source:\s*[^)]+\)/gi, '');
  prepared = prepared.replace(/\[\s*Source:\s*[^\]]+\]/gi, '');
  prepared = prepared.replace(/\[\s*[A-Z0-9_]{5,}\s*\]/g, ''); // Internal source IDs like [PATENTS_ACT_SEC_3P]

  // 3. Remove Markdown headings (# Heading), blockquotes (> quote)
  prepared = prepared.replace(/^#{1,6}\s+/gm, '');
  prepared = prepared.replace(/^>\s+/gm, '');

  // 4. Remove Markdown bold/italics/strikethrough/code blocks
  prepared = prepared.replace(/```[\s\S]*?```/g, '');
  prepared = prepared.replace(/`([^`]+)`/g, '$1');
  prepared = prepared.replace(/\*\*([^*]+)\*\*/g, '$1');
  prepared = prepared.replace(/\*([^*]+)\*/g, '$1');
  prepared = prepared.replace(/__([^_]+)__/g, '$1');
  prepared = prepared.replace(/_([^_]+)_/g, '$1');
  prepared = prepared.replace(/~~([^~]+)~~/g, '$1');

  // 5. Remove Markdown list markers (*, -, +, 1., 2.)
  prepared = prepared.replace(/^\s*[-*+]\s+/gm, '');
  prepared = prepared.replace(/^\s*\d+\.\s+/gm, '');

  // 6. Remove UI emojis and decorative symbols
  prepared = prepared.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}🌿🛡️⚙️💡✓✔❌✕✖➜➤►•●★☆🔍🔊🎤]/gu,
    ''
  );

  // 7. Protect Botanical and Scientific names from corruption
  const botanicalPlaceholders: { placeholder: string; original: string }[] = [];
  let botCount = 0;
  for (const botName of BOTANICAL_NAMES) {
    const reg = new RegExp(`\\b${botName.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    prepared = prepared.replace(reg, (match) => {
      const ph = `__BOT_PH_${botCount++}__`;
      botanicalPlaceholders.push({ placeholder: ph, original: match });
      return ph;
    });
  }

  // 8. If non-English, convert English structural lead-ins
  if (language !== 'en' && STRUCTURAL_WORDS_MAP[language]) {
    for (const [pattern, spokenReplacement] of STRUCTURAL_WORDS_MAP[language]) {
      prepared = prepared.replace(pattern, spokenReplacement);
    }
  }

  // 9. If non-English, transform Legal Identifiers for natural phonetic spoken rendering
  if (language !== 'en') {
    const spokenRules = SPOKEN_LEGAL_MAP[language] || SPOKEN_LEGAL_MAP.hi || [];
    for (const [pattern, spokenReplacement] of spokenRules) {
      prepared = prepared.replace(pattern, spokenReplacement);
    }
  }

  // 10. If non-English, convert standalone ASCII numerals to native script numerals
  if (language !== 'en' && DIGIT_MAPS[language]) {
    const digitMap = DIGIT_MAPS[language];
    // Replace ASCII digits that are part of numbers
    prepared = prepared.replace(/\d/g, (d) => digitMap[parseInt(d, 10)] || d);
  }

  // 11. Restore Botanical Names intact
  for (const { placeholder, original } of botanicalPlaceholders) {
    prepared = prepared.replace(placeholder, original);
  }

  // 12. Normalize repetitive punctuation and dashes
  prepared = prepared.replace(/\.{2,}/g, '.');
  prepared = prepared.replace(/[-–—]{2,}/g, '—');
  prepared = prepared.replace(/\s*([,;:.!?])\s*/g, '$1 ');

  // 13. Clean excessive whitespace
  prepared = prepared.replace(/\s+/g, ' ').trim();

  return prepared;
}

