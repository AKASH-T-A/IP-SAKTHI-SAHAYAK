import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.resolve(__dirname, '../frontend/src/i18n/translations/index.ts');
const content = fs.readFileSync(indexPath, 'utf-8');

const dictRegex = /export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});/g;
const dictionaries = {};
let match;
while ((match = dictRegex.exec(content)) !== null) {
  dictionaries[match[1].toLowerCase()] = JSON.parse(match[2]);
}

const kn = dictionaries['kn'];
const en = dictionaries['en'];

console.log('=== KANNADA HOME PAGE RENDERED SECTIONS VERIFICATION ===\n');

// 1. Navbar
console.log('1. NAVBAR:');
['nav.home', 'nav.explore', 'nav.cases', 'nav.evidence', 'nav.assistant', 'nav.search', 'nav.signIn', 'nav.startCase'].forEach(k => {
  console.log(`   ${k}: "${kn[k]}"`);
});

// 2. Hero
console.log('\n2. HERO:');
['home.hero.badge', 'home.hero.title', 'home.hero.subtitle', 'home.hero.cta_start', 'home.hero.cta_search'].forEach(k => {
  console.log(`   ${k}: "${kn[k]}"`);
});

// 3. Demo Story (The exact area user reported had Hindi!)
console.log('\n3. DEMO STORY & WORKFLOW (User reported Hindi here):');
['home.demo.badge', 'home.demo.simulation', 'home.demo.title', 'home.demo.story', 'home.demo.notice', 'home.demo.startCase', 'home.demo.inspectDossier'].forEach(k => {
  console.log(`   ${k}: "${kn[k]}"`);
});

console.log('\n4. DEMO 7-STEP FLOW (User reported Hindi here):');
for (let i = 1; i <= 7; i++) {
  console.log(`   Step ${i}: "${kn[`home.demo.step${i}.label`]}" - "${kn[`home.demo.step${i}.sub`]}"`);
}

// 5. Sample Evidence Card (User reported English here)
console.log('\n5. SAMPLE EVIDENCE CARD:');
['home.evidence.sample', 'home.evidence.actIndia', 'home.evidence.actName', 'home.evidence.sec3pText', 'home.evidence.strength', 'home.evidence.high', 'home.evidence.whyRelevant', 'home.evidence.viewSource', 'home.evidence.disclaimer'].forEach(k => {
  console.log(`   ${k}: "${kn[k]}"`);
});

// 6. Multilingual Showcase (User reported hardcoded English and Hindi cards here)
console.log('\n6. MULTILINGUAL SHOWCASE CARDS:');
['home.hero.multilingual_title', 'home.hero.multilingual_desc', 'home.multilingual.activeLanguage', 'home.multilingual.schedule8', 'home.multilingual.all22', 'home.multilingual.isolationTitle', 'home.multilingual.isolationDesc'].forEach(k => {
  console.log(`   ${k}: "${kn[k]}"`);
});

// 7. Intelligence Components
console.log('\n7. INTELLIGENCE COMPONENTS (EvidenceDrawer, GapView, ChainView, Uploader, TimeMachine, Board):');
['intel.act', 'intel.chapter', 'intel.section', 'intel.subsection', 'intel.clause', 'intel.whatSourceEstablishes', 'intel.whatSourceDoesNotEstablish', 'intel.noGapsTitle', 'intel.noGapsDesc', 'intel.groundingTraceActive', 'intel.groundingTraceDesc', 'intel.cleanVerified', 'intel.quarantined', 'intel.securityPrinciple', 'intel.provenanceTracer', 'intel.timeMachineDesc', 'intel.sec3pBar', 'intel.synergyRequired', 'intel.slaGmpRequired'].forEach(k => {
  console.log(`   ${k}: "${kn[k]}"`);
});

// Verify no Devanagari in any of these
const devRegex = /[\u0900-\u097F]/;
let devCount = 0;
for (const [k, v] of Object.entries(kn)) {
  if (devRegex.test(v)) {
    devCount++;
    console.error(`ERROR: Key "${k}" has Devanagari in Kannada: "${v}"`);
  }
}

if (devCount === 0) {
  console.log('\n✅ VERIFICATION COMPLETE: ZERO Devanagari/Hindi characters exist in the Kannada UI.');
} else {
  console.error(`\n❌ FAILED: ${devCount} Devanagari characters found.`);
  process.exit(1);
}
