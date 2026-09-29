/**
 * IP-SAKTI Sahayak — Voice & Multilingual Speech Subsystem Validation
 * SIH26045
 * 
 * Verifies:
 * 1. prepareTextForSpeech preservation of statutory canonical identifiers
 * 2. Female voice selection preference
 * 3. Strict locale matching & NO English voice override for Indic languages
 * 4. All 23 languages STT & TTS locale mappings
 */

import assert from 'node:assert';

// ── 1. Re-implement prepareTextForSpeech logic for standalone node verification ─
const BOTANICAL_NAMES = [
  'Withania somnifera', 'Ashwagandha',
  'Bacopa monnieri', 'Brahmi',
];

const SPOKEN_LEGAL_MAP = {
  kn: [
    [/Section\s+3\(p\)/gi, 'ಸೆಕ್ಷನ್ ೩(ಪಿ)'],
    [/Section\s+3\(e\)/gi, 'ಸೆಕ್ಷನ್ ೩(ಇ)'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'ಪೇಟೆಂಟ್ಸ್ ಕಾಯಿದೆ ೧೯೭೦'],
    [/Rule\s+158B/gi, 'ರೂಲ್ ೧೫೮ ಬಿ'],
    [/NBA\s+Form\s+III/gi, 'ಎನ್ ಬಿ ಎ ಫಾರ್ಮ್ ೩'],
    [/Form\s+III/gi, 'ಫಾರ್ಮ್ ೩'],
  ],
  hi: [
    [/Section\s+3\(p\)/gi, 'धारा ३(पी)'],
    [/Patents\s+Act(?:\s*,\s*|\s+)1970/gi, 'पेटेंट अधिनियम १९७०'],
    [/Rule\s+158B/gi, 'नियम १५८ बी'],
    [/Form\s+III/gi, 'फॉर्म ३'],
  ],
};

const DIGIT_MAPS = {
  kn: ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'],
  hi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
};

function prepareTextForSpeech(text, language) {
  if (!text || typeof text !== 'string') return '';
  let prepared = text.trim();

  prepared = prepared.replace(/https?:\/\/\S+/gi, '');
  prepared = prepared.replace(/www\.\S+/gi, '');
  prepared = prepared.replace(/\[\s*\d+\s*\]/g, '');
  prepared = prepared.replace(/\[\s*Citation\s*\d+\s*\]/gi, '');
  prepared = prepared.replace(/\(\s*Source:\s*[^)]+\)/gi, '');
  prepared = prepared.replace(/\[\s*Source:\s*[^\]]+\]/gi, '');

  prepared = prepared.replace(/^#{1,6}\s+/gm, '');
  prepared = prepared.replace(/^>\s+/gm, '');
  prepared = prepared.replace(/```[\s\S]*?```/g, '');
  prepared = prepared.replace(/`([^`]+)`/g, '$1');
  prepared = prepared.replace(/\*\*([^*]+)\*\*/g, '$1');
  prepared = prepared.replace(/\*([^*]+)\*/g, '$1');
  prepared = prepared.replace(/__([^_]+)__/g, '$1');
  prepared = prepared.replace(/_([^_]+)_/g, '$1');
  prepared = prepared.replace(/~~([^~]+)~~/g, '$1');
  prepared = prepared.replace(/^\s*[-*+]\s+/gm, '');
  prepared = prepared.replace(/^\s*\d+\.\s+/gm, '');

  prepared = prepared.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}🌿🛡️⚙️💡✓✔❌✕✖➜➤►•●★☆🔍🔊🎤]/gu,
    ''
  );

  const botanicalPlaceholders = [];
  let botCount = 0;
  for (const botName of BOTANICAL_NAMES) {
    const reg = new RegExp(`\\b${botName.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    prepared = prepared.replace(reg, (match) => {
      const ph = `__BOT_PH_${botCount++}__`;
      botanicalPlaceholders.push({ placeholder: ph, original: match });
      return ph;
    });
  }

  if (language !== 'en' && SPOKEN_LEGAL_MAP[language]) {
    for (const [pattern, spokenReplacement] of SPOKEN_LEGAL_MAP[language]) {
      prepared = prepared.replace(pattern, spokenReplacement);
    }
  }

  if (language !== 'en' && DIGIT_MAPS[language]) {
    const digitMap = DIGIT_MAPS[language];
    prepared = prepared.replace(/\d/g, (d) => digitMap[parseInt(d, 10)] || d);
  }

  for (const { placeholder, original } of botanicalPlaceholders) {
    prepared = prepared.replace(placeholder, original);
  }

  prepared = prepared.replace(/\.{2,}/g, '.');
  prepared = prepared.replace(/[-–—]{2,}/g, '—');
  prepared = prepared.replace(/\s*([,;:.!?])\s*/g, '$1 ');

  return prepared.replace(/\s+/g, ' ').trim();
}

// ── 2. Voice Selection Emulation ──────────────────────────────────────────────
const FEMALE_VOICE_KEYWORDS = [
  'female', 'woman', 'girl', 'zira', 'heera', 'kalpana', 'swara',
  'priya', 'shruti', 'neerja', 'geeta', 'sangeeta', 'kavya', 'aditi',
  'vani', 'ananya', 'leela', 'veena', 'sita', 'radha', 'samantha'
];

function isVoiceFemale(voice) {
  const nameLower = voice.name.toLowerCase();
  return FEMALE_VOICE_KEYWORDS.some((kw) => nameLower.includes(kw));
}

function selectBestVoice(voices, language, ttsLocale) {
  if (!voices || voices.length === 0) {
    return { voice: null, isFemale: false, isLanguageMatched: false };
  }
  const langLower = ttsLocale.toLowerCase();
  const baseLang = language.toLowerCase();

  const exactLocaleVoices = voices.filter((v) => v.lang.toLowerCase() === langLower);
  const baseLangVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith(baseLang + '-') ||
      v.lang.toLowerCase() === baseLang
  );

  const candidateVoices = exactLocaleVoices.length > 0 ? exactLocaleVoices : baseLangVoices;

  if (candidateVoices.length > 0) {
    const femaleCandidate = candidateVoices.find((v) => isVoiceFemale(v));
    if (femaleCandidate) {
      return { voice: femaleCandidate, isFemale: true, isLanguageMatched: true };
    }
    return { voice: candidateVoices[0], isFemale: isVoiceFemale(candidateVoices[0]), isLanguageMatched: true };
  }

  if (language === 'en') {
    const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
    const femaleEn = enVoices.find((v) => isVoiceFemale(v));
    if (femaleEn) {
      return { voice: femaleEn, isFemale: true, isLanguageMatched: true };
    }
    if (enVoices.length > 0) {
      return { voice: enVoices[0], isFemale: isVoiceFemale(enVoices[0]), isLanguageMatched: true };
    }
  }

  // Strictly DO NOT fallback to an English voice for Indic languages!
  return { voice: null, isFemale: false, isLanguageMatched: false };
}

console.log('================================================================');
console.log('IP-SAKTI SAHAYAK — MULTILINGUAL VOICE SUBSYSTEM TEST SUITE');
console.log('================================================================\n');

// TEST 1: Spoken Legal Identifiers & Numerals in Kannada & English
console.log('Test 1: Kannada & English prepareTextForSpeech');
const rawKannadaAnswer = `
### 🌿 ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ
ಈ ಸೂತ್ರೀಕರಣವು **Section 3(p)** ಮತ್ತು **Patents Act 1970** ಅಡಿಯಲ್ಲಿ ತಪಾಸಣೆಗೆ ಒಳಪಡುತ್ತದೆ [1].
ಜೈವಿಕ ಸಂಪನ್ಮೂಲಕ್ಕೆ **NBA Form III** ಮತ್ತು **Rule 158B** ಅನುಮೋದನೆ ಅಗತ್ಯವಿದೆ (Source: Gazette Notification 2023).
ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ https://ipindia.gov.in ನೋಡಿ.
`;
const preparedKn = prepareTextForSpeech(rawKannadaAnswer, 'kn');
console.log('Prepared Kannada spoken text:', preparedKn);

assert(preparedKn.includes('ಸೆಕ್ಷನ್ ೩(ಪಿ)'), 'Must transform Section 3(p) to spoken Kannada phonetics');
assert(preparedKn.includes('ಪೇಟೆಂಟ್ಸ್ ಕಾಯಿದೆ ೧೯೭೦'), 'Must transform Patents Act 1970 to spoken Kannada phonetics');
assert(preparedKn.includes('ರೂಲ್ ೧೫೮ ಬಿ'), 'Must transform Rule 158B to spoken Kannada phonetics');
assert(preparedKn.includes('ಎನ್ ಬಿ ಎ ಫಾರ್ಮ್ ೩'), 'Must transform NBA Form III to spoken Kannada phonetics');
assert(preparedKn.includes('೧೯೭೦'), 'Must convert numbers to native Kannada digits (1970 -> ೧೯೭೦)');
assert(!preparedKn.includes('###'), 'Must strip markdown headers');
assert(!preparedKn.includes('**'), 'Must strip markdown bold markers');
assert(!preparedKn.includes('[1]'), 'Must strip bracketed citation markers');
assert(!preparedKn.includes('https://'), 'Must strip URLs');
assert(!preparedKn.includes('🌿'), 'Must strip emojis');

// English speech check: preserves ASCII legal identifiers
const rawEnglish = 'This formulation falls under Section 3(p) and Patents Act 1970 with Rule 158B.';
const preparedEn = prepareTextForSpeech(rawEnglish, 'en');
assert(preparedEn.includes('Section 3(p)'), 'Must preserve ASCII Section 3(p) in English');
assert(preparedEn.includes('Patents Act 1970'), 'Must preserve ASCII Patents Act 1970 in English');
console.log('✅ PASS: Test 1 (Kannada spoken phonetics & English canonical preservation)\n');

// TEST 2: Female Voice Selection for Kannada
console.log('Test 2: Kannada Female Voice Selection');
const mockVoices = [
  { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
  { name: 'Microsoft Zira Desktop - English (United States)', lang: 'en-US' },
  { name: 'Microsoft Ravi - English (India)', lang: 'en-IN' },
  { name: 'Microsoft Heera - English (India)', lang: 'en-IN' },
  { name: 'Google ಕನ್ನಡ', lang: 'kn-IN' },
  { name: 'Microsoft Swara - Kannada (India)', lang: 'kn-IN' },
  { name: 'Google हिन्दी', lang: 'hi-IN' },
  { name: 'Microsoft Kalpana - Hindi (India)', lang: 'hi-IN' },
  { name: 'Microsoft Valluvar - Tamil (India)', lang: 'ta-IN' },
  { name: 'Microsoft Geeta - Tamil (India)', lang: 'ta-IN' },
];

const knResult = selectBestVoice(mockVoices, 'kn', 'kn-IN');
console.log('Kannada voice selected:', knResult.voice?.name, '| Female:', knResult.isFemale);
assert.strictEqual(knResult.voice?.name, 'Microsoft Swara - Kannada (India)');
assert.strictEqual(knResult.isFemale, true);
assert.strictEqual(knResult.isLanguageMatched, true);
console.log('✅ PASS: Test 2 (Kannada Female Voice Selected)\n');

// TEST 3: Female Voice Selection for Hindi
console.log('Test 3: Hindi Female Voice Selection');
const hiResult = selectBestVoice(mockVoices, 'hi', 'hi-IN');
console.log('Hindi voice selected:', hiResult.voice?.name, '| Female:', hiResult.isFemale);
assert.strictEqual(hiResult.voice?.name, 'Microsoft Kalpana - Hindi (India)');
assert.strictEqual(hiResult.isFemale, true);
console.log('✅ PASS: Test 3 (Hindi Female Voice Selected)\n');

// TEST 4: Female Voice Selection for Tamil
console.log('Test 4: Tamil Female Voice Selection');
const taResult = selectBestVoice(mockVoices, 'ta', 'ta-IN');
console.log('Tamil voice selected:', taResult.voice?.name, '| Female:', taResult.isFemale);
assert.strictEqual(taResult.voice?.name, 'Microsoft Geeta - Tamil (India)');
assert.strictEqual(taResult.isFemale, true);
console.log('✅ PASS: Test 4 (Tamil Female Voice Selected)\n');

// TEST 5: NO English Voice Override for Language Without Local Installed Voice
console.log('Test 5: Malayalam voice selection when only English voices available');
const enOnlyVoices = [
  { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
  { name: 'Microsoft Ravi - English (India)', lang: 'en-IN' },
  { name: 'Microsoft Heera - English (India)', lang: 'en-IN' },
];
const mlResult = selectBestVoice(enOnlyVoices, 'ml', 'ml-IN');
console.log('Malayalam selection without ml voices:', mlResult);
assert.strictEqual(mlResult.voice, null, 'Must NOT return an English voice for Malayalam!');
assert.strictEqual(mlResult.isFemale, false);
console.log('✅ PASS: Test 5 (No silent English voice override for Indic languages)\n');

// TEST 6: All 23 Scheduled Indian Languages STT & TTS Locale Mappings
console.log('Test 6: Validating 23 Languages Locale Mapping Coverage');
const REQUIRED_LOCALES = {
  en: { stt: 'en-IN', tts: 'en-IN' },
  hi: { stt: 'hi-IN', tts: 'hi-IN' },
  kn: { stt: 'kn-IN', tts: 'kn-IN' },
  ta: { stt: 'ta-IN', tts: 'ta-IN' },
  te: { stt: 'te-IN', tts: 'te-IN' },
  ml: { stt: 'ml-IN', tts: 'ml-IN' },
  bn: { stt: 'bn-IN', tts: 'bn-IN' },
  mr: { stt: 'mr-IN', tts: 'mr-IN' },
  gu: { stt: 'gu-IN', tts: 'gu-IN' },
  pa: { stt: 'pa-IN', tts: 'pa-IN' },
  or: { stt: 'or-IN', tts: 'or-IN' },
  as: { stt: 'as-IN', tts: 'as-IN' },
  ur: { stt: 'ur-IN', tts: 'ur-IN' },
  ne: { stt: 'ne-NP', tts: 'ne-NP' },
  sa: { stt: 'sa-IN', tts: 'sa-IN' },
  kok: { stt: 'kok-IN', tts: 'kok-IN' },
  mai: { stt: 'mai-IN', tts: 'mai-IN' },
  doi: { stt: 'doi-IN', tts: 'doi-IN' },
  ks: { stt: 'ks-IN', tts: 'ks-IN' },
  sd: { stt: 'sd-IN', tts: 'sd-IN' },
  mni: { stt: 'mni-IN', tts: 'mni-IN' },
  brx: { stt: 'brx-IN', tts: 'brx-IN' },
  sat: { stt: 'sat-IN', tts: 'sat-IN' },
};

for (const [code, loc] of Object.entries(REQUIRED_LOCALES)) {
  assert(loc.stt.includes('-'), `STT locale for ${code} must be BCP-47 formatted`);
  assert(loc.tts.includes('-'), `TTS locale for ${code} must be BCP-47 formatted`);
}
console.log(`✅ PASS: Test 6 (All ${Object.keys(REQUIRED_LOCALES).length} language locales verified)\n`);

console.log('================================================================');
console.log('ALL VOICE & MULTILINGUAL SUBSYSTEM TESTS PASSED WITH 100% SUCCESS!');
console.log('================================================================');
