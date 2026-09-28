/**
 * IP-SAKTI Sahayak — Automated Translation Completeness Checker
 * SIH26045
 * 
 * Reports:
 * Language, Total keys, Translated keys, English fallback keys, Missing keys, Canonical/exempt keys, Coverage percentage
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find index.ts
let indexPath = path.resolve(__dirname, '../src/i18n/translations/index.ts');
if (!fs.existsSync(indexPath)) {
  indexPath = path.resolve(__dirname, '../../frontend/src/i18n/translations/index.ts');
}

if (!fs.existsSync(indexPath)) {
  console.error(`ERROR: Could not locate index.ts at ${indexPath}`);
  process.exit(1);
}

const content = fs.readFileSync(indexPath, 'utf-8');

const dictRegex = /export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});/g;

const dictionaries = {};
let match;
while ((match = dictRegex.exec(content)) !== null) {
  const langCode = match[1].toLowerCase();
  try {
    dictionaries[langCode] = JSON.parse(match[2]);
  } catch (err) {
    console.error(`Failed to parse JSON for ${match[1]}:`, err);
    process.exit(1);
  }
}

const enDict = dictionaries['en'];
if (!enDict) {
  console.error('ERROR: English (en) canonical dictionary not found!');
  process.exit(1);
}

const canonicalKeys = Object.keys(enDict);
const totalCanonical = canonicalKeys.length;

console.log('========================================================================================');
console.log('IP-SAKTI SAHAYAK — MULTILINGUAL TRANSLATION AUDIT & PARITY VERIFICATION');
console.log('========================================================================================\n');
console.log(`Canonical English Keys: ${totalCanonical}\n`);

const ALL_LANGS = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'kok', name: 'Konkani' },
  { code: 'mai', name: 'Maithili' },
  { code: 'doi', name: 'Dogri' },
  { code: 'ks', name: 'Kashmiri' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'mni', name: 'Manipuri' },
  { code: 'brx', name: 'Bodo' },
  { code: 'sat', name: 'Santali' },
  { code: 'ne', name: 'Nepali' },
];

const CANONICAL_EXEMPT_VALUES = new Set([
  'Section 3(p)', 'Rule 158B', 'Form III', 'Schedule T', '23', 'sha256-verified'
]);

function isCanonicalExempt(key, enVal) {
  if (CANONICAL_EXEMPT_VALUES.has(enVal.trim())) return true;
  if (enVal.startsWith('http://') || enVal.startsWith('https://')) return true;
  return false;
}

let hasMissingFailures = false;
console.log('Language        Code    Total   Translated  Fallback  Exempt  Missing  Native Coverage');
console.log('----------------------------------------------------------------------------------------');

for (const lang of ALL_LANGS) {
  const dict = dictionaries[lang.code];
  if (!dict) {
    console.log(`${lang.name.padEnd(16)}${lang.code.padEnd(8)}0       0           0         0       ${totalCanonical.toString().padEnd(9)}0.0% (MISSING)`);
    hasMissingFailures = true;
    continue;
  }

  const keys = Object.keys(dict);
  const keySet = new Set(keys);
  const missing = canonicalKeys.filter((k) => !keySet.has(k));

  let translatedCount = 0;
  let fallbackCount = 0;
  let exemptCount = 0;

  for (const k of canonicalKeys) {
    const enVal = enDict[k];
    const langVal = dict[k];

    if (isCanonicalExempt(k, enVal)) {
      exemptCount++;
    } else if (lang.code === 'en') {
      translatedCount++;
    } else if (langVal === enVal) {
      fallbackCount++;
    } else {
      translatedCount++;
    }
  }

  const totalEvaluated = totalCanonical - exemptCount;
  const nativePercent = ((translatedCount / totalEvaluated) * 100).toFixed(1);

  if (missing.length > 0) hasMissingFailures = true;

  console.log(
    `${lang.name.padEnd(16)}${lang.code.padEnd(8)}${keys.length.toString().padEnd(8)}${translatedCount.toString().padEnd(12)}${fallbackCount.toString().padEnd(10)}${exemptCount.toString().padEnd(8)}${missing.length.toString().padEnd(9)}${nativePercent}%`
  );
}

console.log('----------------------------------------------------------------------------------------');
if (hasMissingFailures) {
  console.error('\nFAIL: Critical missing keys detected in one or more languages.');
  process.exit(1);
} else {
  console.log('\nSUCCESS: 100% key parity achieved across all 23 languages without missing keys!\n');
  process.exit(0);
}
