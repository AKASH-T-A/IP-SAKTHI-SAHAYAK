/**
 * IP-SAKTI Sahayak — All 22 Scheduled Indian Languages + English Registry
 * SIH26045 | Eighth Schedule of the Constitution of India
 */

export type Direction = 'ltr' | 'rtl';

export type LanguageCode =
  | 'en'
  | 'as'
  | 'bn'
  | 'brx'
  | 'doi'
  | 'gu'
  | 'hi'
  | 'kn'
  | 'ks'
  | 'kok'
  | 'mai'
  | 'ml'
  | 'mni'
  | 'mr'
  | 'ne'
  | 'or'
  | 'pa'
  | 'sa'
  | 'sat'
  | 'sd'
  | 'ta'
  | 'te'
  | 'ur';

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script: string;
  dir: Direction;
  regionGroup: 'National / Fallback' | 'Southern' | 'Northern' | 'Eastern / North-Eastern' | 'Western' | 'Classical / Himalayan';
}

export const ALL_LANGUAGES: LanguageMeta[] = [
  // Canonical Fallback
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', dir: 'ltr', regionGroup: 'National / Fallback' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', dir: 'ltr', regionGroup: 'National / Fallback' },

  // Southern Languages
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', dir: 'ltr', regionGroup: 'Southern' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', dir: 'ltr', regionGroup: 'Southern' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', dir: 'ltr', regionGroup: 'Southern' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', dir: 'ltr', regionGroup: 'Southern' },

  // Western Languages
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', dir: 'ltr', regionGroup: 'Western' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', dir: 'ltr', regionGroup: 'Western' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', dir: 'ltr', regionGroup: 'Western' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي / सिन्धी', script: 'Perso-Arabic', dir: 'rtl', regionGroup: 'Western' },

  // Eastern & North-Eastern Languages
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', dir: 'ltr', regionGroup: 'Eastern / North-Eastern' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali', dir: 'ltr', regionGroup: 'Eastern / North-Eastern' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', dir: 'ltr', regionGroup: 'Eastern / North-Eastern' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', dir: 'ltr', regionGroup: 'Eastern / North-Eastern' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্ / মণিপুরী', script: 'Bengali', dir: 'ltr', regionGroup: 'Eastern / North-Eastern' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', script: 'Devanagari', dir: 'ltr', regionGroup: 'Eastern / North-Eastern' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', dir: 'ltr', regionGroup: 'Eastern / North-Eastern' },

  // Northern & Himalayan Languages
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', dir: 'ltr', regionGroup: 'Northern' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', dir: 'rtl', regionGroup: 'Northern' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', dir: 'ltr', regionGroup: 'Northern' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر / कश्मीरी', script: 'Perso-Arabic', dir: 'rtl', regionGroup: 'Northern' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', dir: 'ltr', regionGroup: 'Classical / Himalayan' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', dir: 'ltr', regionGroup: 'Classical / Himalayan' },
];

export const LANGUAGE_MAP = new Map<LanguageCode, LanguageMeta>(
  ALL_LANGUAGES.map((l) => [l.code, l])
);

export const RTL_CODES = new Set<LanguageCode>(['ur', 'ks', 'sd']);

export function isRtlLanguage(code: LanguageCode): boolean {
  return RTL_CODES.has(code);
}

export function getLanguageMeta(code: LanguageCode): LanguageMeta {
  return LANGUAGE_MAP.get(code) || ALL_LANGUAGES[0];
}
