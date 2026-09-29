/**
 * IP-SAKTI Sahayak — Full Page & Component Multilingual Verification Script
 * Validates all 23 languages across all 12 key pages & 9 intelligence components
 * using canonical keys from MASTER_DICTIONARY.
 */

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

const ALL_23_LANGS = [
  'en', 'hi', 'kn', 'ta', 'te', 'ml', 'mr', 'bn', 'gu', 'pa',
  'or', 'as', 'ur', 'sa', 'kok', 'mai', 'doi', 'ks', 'sd', 'mni',
  'brx', 'sat', 'ne'
];

const RTL_LANGS = new Set(['ur', 'ks', 'sd']);

// 12 Key Pages and their canonical keys from index.ts
const PAGE_VERIFICATIONS = {
  'Navbar': ['nav.home', 'nav.explore', 'nav.cases', 'nav.evidence', 'nav.assistant', 'nav.search', 'nav.login', 'nav.register'],
  'Home': ['home.hero.title', 'home.hero.badge', 'home.pipeline.question', 'home.pipeline.classify', 'home.pipeline.evidence', 'home.pipeline.intelligence', 'home.pipeline.action', 'home.domain.plantVarietyProtection'],
  'Explore': ['explore.breadcrumb', 'explore.title', 'explore.subtitle', 'explore.searchPlaceholder', 'explore.allFrameworks', 'explore.ipPatents', 'explore.ayushFssai', 'explore.bioAbs', 'explore.tkTkdl'],
  'Search': ['search.heading', 'search.breadcrumb', 'search.placeholder', 'search.btnSearch', 'search.suggestedLabel', 'search.recentLabel', 'search.clearLabel', 'search.advancedFilters', 'search.ipPathways', 'search.statutoryEvidence'],
  'Cases': ['cases.title', 'cases.badge', 'cases.subtitle', 'cases.newCase', 'cases.searchPlaceholder', 'cases.emptyTitle', 'cases.emptyDesc', 'cases.jurisdictionIndia', 'cases.noMatch'],
  'Wizard': ['wizard.stepProgress', 'wizard.guidedSetup', 'wizard.assetTitle', 'wizard.assetDesc', 'wizard.addIngredient', 'wizard.plantPart', 'wizard.dnaReady'],
  'Case Detail': ['caseDetail.loading', 'caseDetail.tabSummary', 'caseDetail.tabDna', 'caseDetail.tabClassifications', 'caseDetail.tabRegulations', 'caseDetail.tabIpPathways', 'caseDetail.tabAbs', 'caseDetail.tabPriorArt', 'caseDetail.tabEvidenceGaps', 'caseDetail.tabEvidenceChain', 'caseDetail.tabNextActions', 'caseDetail.exportDossier', 'caseDetail.timeMachine', 'caseDetail.editFormulation'],
  'Evidence': ['evidence.title', 'evidence.badge', 'evidence.searchPlaceholder', 'evidence.inspectCitation', 'evidence.noCorpusFound', 'evidence.breadcrumb', 'evidence.allAuthorities', 'evidence.allTypes'],
  'Assistant': ['assistant.breadcrumb', 'assistant.title', 'assistant.badge', 'assistant.subtitle', 'assistant.activeCase', 'assistant.bannerActive', 'assistant.suggestedInquiries', 'assistant.directAnswer', 'assistant.why', 'assistant.officialCitations', 'assistant.evidenceGaps', 'assistant.practicalMeaning', 'assistant.nextActions', 'assistant.placeholder', 'assistant.send', 'assistant.disclaimerFooter'],
  'Report': ['report.header', 'report.title', 'report.subtitle', 'report.ref', 'report.date', 'report.corpusHash', 'report.returnDossier', 'report.printSave', 'report.sec1', 'report.sec2', 'report.sec3', 'report.sec4', 'report.sec5', 'report.sec6', 'report.sec7', 'report.tableIngredients', 'report.name', 'report.botanical', 'report.part', 'report.ratio', 'report.origin'],
  'Login': ['auth.welcomeBack', 'auth.signInDesc', 'auth.email', 'auth.password', 'auth.signIn', 'auth.noAccount', 'auth.showPassword', 'auth.hidePassword', 'auth.sessionExpired'],
  'Register': ['auth.createAccountTitle', 'auth.createAccountDesc', 'auth.fullName', 'auth.email', 'auth.password', 'auth.createAccount', 'auth.haveAccount', 'auth.signIn', 'auth.preferredLanguage', 'auth.charRequirement'],
  'Claims': ['regulatory.claimsCheckTitle', 'regulatory.claimsCheckDesc'],
  'LabelReview': ['regulatory.labelReviewTitle', 'regulatory.labelReviewDesc'],
  'International': ['international.treatiesTitle', 'international.treatiesDesc'],
  'Regulations': ['nav.regulations', 'cases.formulationCategory', 'action.requestExpertReview'],
  'WizardPlantParts': ['wizard.classicalNone', 'wizard.docCoa', 'wizard.docExcerpt', 'wizard.partBark', 'wizard.partFlower', 'wizard.partLeaf', 'wizard.partResin', 'wizard.partRhizome', 'wizard.partRoot', 'wizard.partSeed', 'wizard.partWhole']
};

// 9 Intelligence Components canonical keys from index.ts
const INTELLIGENCE_COMPONENT_KEYS = {
  'EvidenceDrawer': ['intel.authority', 'intel.closeDrawer', 'intel.hierarchy', 'intel.excerpt', 'evidence.why_applies', 'evidence.what_source_establishes'],
  'EvidenceChainView': ['intel.chainTitle', 'intel.factTriggered', 'intel.ruleApplied', 'intel.matrixTitle'],
  'EvidenceGapView': ['intel.gapsTitle', 'intel.resolutionStrategy'],
  'EvidenceStrengthBadge': ['strength.high', 'strength.moderate', 'strength.limited', 'strength.insufficient'],
  'AbstentionBanner': ['common.error', 'common.status'],
  'IntelligenceBoard': ['intel.matrixTitle', 'intel.chainTitle', 'intel.gapsTitle'],
  'RegulatoryTimeMachine': ['intel.timeMachineTitle', 'intel.historicalAmendments'],
  'DocumentUploader': ['intel.uploadTitle', 'intel.dragDrop'],
  'WhySeeingThisModal': ['intel.whyTitle', 'intel.deterministicVerification']
};

console.log('========================================================================================');
console.log('IP-SAKTI SAHAYAK — FULL MULTILINGUAL SUITE VALIDATION (23 LANGUAGES × 21 TARGETS)');
console.log('========================================================================================\n');

let totalFailures = 0;

for (const lang of ALL_23_LANGS) {
  const dict = dictionaries[lang];
  if (!dict) {
    console.error(`FAIL: Missing entire dictionary for language: ${lang}`);
    totalFailures++;
    continue;
  }

  const isRtl = RTL_LANGS.has(lang);
  let langPageFails = 0;

  for (const [pageName, keys] of Object.entries(PAGE_VERIFICATIONS)) {
    for (const key of keys) {
      if (!dict[key]) {
        console.error(`[${lang.toUpperCase()}] Missing key for page ${pageName}: ${key}`);
        langPageFails++;
      }
    }
  }

  for (const [compName, keys] of Object.entries(INTELLIGENCE_COMPONENT_KEYS)) {
    for (const key of keys) {
      if (!dict[key]) {
        console.error(`[${lang.toUpperCase()}] Missing key for intelligence component ${compName}: ${key}`);
        langPageFails++;
      }
    }
  }

  if (langPageFails === 0) {
    console.log(`✓ [${lang.toUpperCase()}] All 12 pages + 9 intelligence components fully verified (${isRtl ? 'RTL' : 'LTR'})`);
  } else {
    totalFailures += langPageFails;
  }
}

console.log('\n----------------------------------------------------------------------------------------');
if (totalFailures === 0) {
  console.log('🎉 SUCCESS: All 23 Indian Languages pass 100% key and component coverage verification!\n');
  process.exit(0);
} else {
  console.error(`💥 FAILED: ${totalFailures} missing translations detected.`);
  process.exit(1);
}
