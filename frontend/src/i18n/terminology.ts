/**
 * IP-SAKTI Sahayak — Statutory Legal & Classical Ayurveda Terminology Layer
 * SIH26045
 * 
 * Rules:
 * 1. Legal identifiers (Section 3(p), Rule 158B, Form III, Patents Act 1970) are NEVER translated.
 * 2. Critical legal terms show Dual Display: "Translated (Canonical English)" e.g. "ಪೇಟೆಂಟ್ (Patent)"
 * 3. Classical Sanskrit Ayurveda terms are preserved with localized script representation where applicable.
 */

import { LanguageCode } from './languages';

export interface TermDefinition {
  canonical: string;
  translations: Partial<Record<LanguageCode, string>>;
  definition: string;
  authority: string;
  isAyurvedaClassical?: boolean;
}

export const LEGAL_TERMINOLOGY: Record<string, TermDefinition> = {
  patent: {
    canonical: 'Patent',
    translations: {
      hi: 'पेटेंट',
      kn: 'ಪೇಟೆಂಟ್',
      ta: 'காப்புரிமை',
      te: 'పేటెంట్',
      ml: 'പേറ്റന്റ്',
      bn: 'পেটেন্ট',
      mr: 'पेटंट',
      gu: 'પેટન્ટ',
      pa: 'ਪੇਟੈਂਟ',
      or: 'ପେଟେଣ୍ଟ',
      as: 'পেটেণ্ট',
      ur: 'پیٹنٹ',
      sa: 'स्वाम्यपत्रम् (Patent)',
    },
    definition: 'Statutory exclusive right granted for an invention providing new technical solution.',
    authority: 'Indian Patent Office (CGPDTM), Patents Act, 1970',
  },
  prior_art: {
    canonical: 'Prior Art',
    translations: {
      hi: 'पूर्व कला',
      kn: 'ಮುಂಚಿತ ಕಲೆ / ಪೂರ್ವಕಲೆ',
      ta: 'முந்தைய கலை',
      te: 'ముందస్తు సాంకేతిక జ్ఞానం',
      ml: 'മുൻകാല വിജ്ഞാനം',
      bn: 'পূর্ববর্তী শিল্পজ্ঞান',
      mr: 'पूर्वकला ज्ञान',
      gu: 'પૂર્વ જ્ઞાન',
      pa: 'ਪੂਰਵ ਕਲਾ',
      or: 'ପୂର୍ବ କଳା',
      ur: 'سابقہ علمی فن',
      sa: 'पूर्वज्ञानम्',
    },
    definition: 'All information made available to the public in any form before filing date.',
    authority: 'Section 2(1)(j), Patents Act, 1970',
  },
  section_3p: {
    canonical: 'Section 3(p) — Traditional Knowledge Bar',
    translations: {
      hi: 'धारा 3(p) — पारंपरिक ज्ञान अपवाद',
      kn: 'ವಿಭಾಗ 3(p) — ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ ತಡೆ',
      ta: 'பிரிவு 3(p) — பாரம்பரிய அறிவு விலக்கு',
      te: 'సెక్షన్ 3(p) — సంప్రదాయ జ్ఞాన నిషేధం',
      ml: 'വകുപ്പ് 3(p) — പരമ്പരാഗത അറിവ് തടസ്സം',
      bn: 'ধারা ৩(পি) — ঐতিহ্যগত জ্ঞান সংক্রান্ত নিষেধাজ্ঞা',
      mr: 'कलम ३(पी) — पारंपारिक ज्ञान निर्बंध',
      gu: 'કલમ 3(p) — પરંપરાગત જ્ઞાન બાધ',
      pa: 'ਧਾਰਾ 3(p) — ਰਵਾਇਤੀ ਗਿਆਨ ਰੋਕ',
      or: 'ଧାରା ୩(ପି) — ପାରମ୍ପରିକ ଜ୍ଞାନ ବାରଣ',
      ur: 'دفعہ 3(p) — روایتی علم کی ممانعت',
      sa: 'धारा ३(p) — पारम्परिकज्ञान-प्रतिबन्धः',
    },
    definition: 'Statutory prohibition against patenting an invention which in effect is traditional knowledge.',
    authority: 'Patents Act, 1970',
  },
  abs: {
    canonical: 'Access and Benefit Sharing (ABS)',
    translations: {
      hi: 'पहुंच और लाभ साझाकरण (ABS)',
      kn: 'ಲಭ್ಯತೆ ಮತ್ತು ಪ್ರಯೋಜನ ಹಂಚಿಕೆ (ABS)',
      ta: 'அணுகல் மற்றும் பயன் பகிர்வு (ABS)',
      te: 'లభ్యత మరియు లాభ భాగస్వామ్యం (ABS)',
      ml: 'ലഭ്യതയും ആനുകൂല്യ പങ്കിടലും (ABS)',
      bn: 'প্রবেশাধিকার ও সুবিধা ভাগাভাগি (ABS)',
      mr: 'प्रवेश आणि लाभ वाटप (ABS)',
      gu: 'પ્રવેશ અને લાભ વહેંચણી (ABS)',
      pa: 'ਪਹੁੰਚ ਅਤੇ ਲਾਭ ਵੰਡ (ABS)',
      or: 'ପ୍ରବେଶ ଏବଂ ଲାଭ ଭାଗବଣ୍ଟା (ABS)',
      ur: 'رسائی اور منافع کی شراکت (ABS)',
      sa: 'प्रवेश-लाभ-वितरणम् (ABS)',
    },
    definition: 'Mandatory mechanism ensuring fair sharing of benefits from utilization of biological resources.',
    authority: 'Section 6, Biological Diversity Act, 2002',
  },
  biological_resource: {
    canonical: 'Biological Resource',
    translations: {
      hi: 'जैविक संसाधन',
      kn: 'ಜೈವಿಕ ಸಂಪನ್ಮೂಲ',
      ta: 'உயிரியல் வளம்',
      te: 'జీవ వనరు',
      ml: 'ജൈവ വിഭവം',
      bn: 'জৈব সম্পদ',
      mr: 'जैविक संसाधन',
      gu: 'જૈવિક સંસાધન',
      pa: 'ਜੈਵਿਕ ਸਰੋਤ',
      or: 'ଜୈବିକ ସମ୍ବଳ',
      ur: 'حیاتیاتی وسائل',
      sa: 'जैविक-संसाधनम्',
    },
    definition: 'Plants, animals, and micro-organisms or parts thereof, their genetic material and by-products.',
    authority: 'Section 2(c), Biological Diversity Act, 2002',
  },
  trademark: {
    canonical: 'Trademark',
    translations: {
      hi: 'व्यापार चिह्न (Trademark)',
      kn: 'ಟ್ರೇಡ್‌ಮಾರ್ಕ್ (Trademark)',
      ta: 'வர்த்தக முத்திரை (Trademark)',
      te: 'ట్రేడ్‌మార్క్ (Trademark)',
      ml: 'വ്യാപാര മുദ്ര (Trademark)',
      bn: 'ট্রেডমার্ক (Trademark)',
      mr: 'व्यापारी चिन्ह (Trademark)',
      gu: 'ટ્રેડમાર્ક (Trademark)',
      pa: 'ਟ੍ਰੇਡਮਾਰਕ (Trademark)',
      or: 'ଟ୍ରେଡ଼ମାର୍କ (Trademark)',
      ur: 'ٹریڈ مارک (Trademark)',
    },
    definition: 'Visual symbol indicating goods originated from a particular enterprise.',
    authority: 'Trade Marks Act, 1999',
  },
  geographical_indication: {
    canonical: 'Geographical Indication (GI)',
    translations: {
      hi: 'भौगोलिक उपदर्शन (GI)',
      kn: 'ಭೌಗೋಳಿಕ ಸೂಚ್ಯಂಕ (GI)',
      ta: 'புவிசார் குறியீடு (GI)',
      te: 'భౌగోళిక సూచిక (GI)',
      ml: 'ഭൂമിശാസ്ത്രപരമായ സൂചിക (GI)',
      bn: 'ভৌগোলিক নির্দেশক (GI)',
      mr: 'भौगोलिक निर्देशांक (GI)',
      gu: 'ભૌગોલિક સંકેત (GI)',
      pa: 'ਭੂਗੋਲਿਕ ਸੰਕੇਤ (GI)',
      or: 'ଭୌଗୋଳିକ ସୂଚକ (GI)',
      ur: 'جغرافیائی اشاریہ (GI)',
    },
    definition: 'Sign identifying goods as originating in a specific territory giving them special quality or reputation.',
    authority: 'Geographical Indications of Goods Act, 1999',
  },
};

export const AYURVEDA_CLASSICAL_TERMS: Record<string, { canonical: string; meaning: string; sanskritDevanagari: string }> = {
  rasayana: {
    canonical: 'Rasayana',
    meaning: 'Rejuvenating formulations promoting longevity and cellular vitality (Caraka Samhita Ci. 1)',
    sanskritDevanagari: 'रसायन',
  },
  churna: {
    canonical: 'Churna',
    meaning: 'Fine powder of completely dried herbs (Sarangadhara Samhita Madhyama Khanda 6)',
    sanskritDevanagari: 'चूर्ण',
  },
  kwatha: {
    canonical: 'Kwatha',
    meaning: 'Decoction boiled to reduced ratio for extraction of water-soluble phytochemicals',
    sanskritDevanagari: 'क्वाथ',
  },
  taila: {
    canonical: 'Taila',
    meaning: 'Medicated lipidic oil formulation processed through Sneha Kalpana',
    sanskritDevanagari: 'तैल',
  },
  ghrita: {
    canonical: 'Ghrita',
    meaning: 'Clarified butter (cow ghee) lipid formulations crossing lipid barriers',
    sanskritDevanagari: 'घृत',
  },
  bhasma: {
    canonical: 'Bhasma',
    meaning: 'Purified, incinerated organo-metallic Ayurvedic nanoparticles (Rasa Shastra)',
    sanskritDevanagari: 'भस्म',
  },
  dravya: {
    canonical: 'Dravya',
    meaning: 'Active substance possessing Guna (attributes) and Karma (pharmacological actions)',
    sanskritDevanagari: 'द्रव्य',
  },
  prakriti: {
    canonical: 'Prakriti',
    meaning: 'Inherent psychosomatic genetic constitution of an individual',
    sanskritDevanagari: 'प्रकृति',
  },
  dosha: {
    canonical: 'Dosha',
    meaning: 'Primary bio-energetic regulatory principles: Vata, Pitta, and Kapha',
    sanskritDevanagari: 'दोष',
  },
};

/**
 * Returns formatted dual-display string: "Translated (Canonical English)"
 * e.g., "ಪೇಟೆಂಟ್ (Patent)" or "காப்புரிமை (Patent)"
 */
export function getDualTerm(termKey: string, lang: LanguageCode): string {
  const term = LEGAL_TERMINOLOGY[termKey];
  if (!term) return termKey;

  const translated = term.translations[lang];
  if (!translated || lang === 'en') {
    return term.canonical;
  }
  return `${translated} (${term.canonical})`;
}
