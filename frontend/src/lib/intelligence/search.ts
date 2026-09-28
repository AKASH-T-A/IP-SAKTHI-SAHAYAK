/**
 * IP-SAKTI Sahayak — Phase 3 Intelligent Search Engine
 * SIH26045
 * 
 * Maps search queries to statutory intents, streams, authoritative evidence citations,
 * and structured result groups (IP Pathways, Evidence, Related, Prior-Art, Cases).
 */

import { SearchIntent, GroupedSearchResult, Citation } from './types';
import { STATUTORY_CORPUS } from './corpus';

function makeCitation(corpusKey: string, relevance: string): Citation {
  const src = STATUTORY_CORPUS[corpusKey];
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

export function performIntelligentSearch(query: string, userCases: { id: string; title: string; status: string }[] = []): GroupedSearchResult {
  const cleanQ = query.trim().toLowerCase();

  let detectedIntent: SearchIntent = 'GENERAL_QUESTION';
  let stream = 'General Knowledge & Traditional Systems';
  let confidence = 0.7;

  // Intent classification heuristics (All Indian Languages + English)
  const isPatent = [
    'patent', 'invent', '3(p)', '3p', 'novelty', 'prior art',
    'ಪೇಟೆಂಟ್', 'ಪೇಟೆಂಟು', 'ಆವಿಷ್ಕಾರ', 'ಹಕ್ಕುಸ್ವಾಮ್ಯ', 'ಮುಂಚಿತ ಕಲೆ',
    'காப்புரிமை', 'கண்டுபிடிப்பு', 'புதுமை', 'முந்தைய கலை',
    'పేటెంట్', 'పేటెంటు', 'ఆవిష్కరణ', 'నవీనత', 'ముందస్తు కళ',
    'पेटेंट', 'आविष्कार', 'नवीनता', 'पूर्व कला',
    'পেটেন্ট', 'আবিষ্কার', 'উদ্ভাবন', 'পূর্ববর্তী শিল্প',
    'पेटंट', 'પેટન્ટ', 'ਪੇਟੈਂਟ', 'ପେଟେଣ୍ଟ', 'پیٹنٹ', 'स्वाम्यपत्रम्'
  ].some((kw) => cleanQ.includes(kw.toLowerCase()));

  const isAbs = [
    'abs', 'biodiversity', 'nba', 'sbb', 'form iii', 'benefit sharing', 'biological',
    'ಜೀವವೈವಿಧ್ಯ', 'ಜೈವಿಕ ಸಂಪನ್ಮೂಲ', 'ಪ್ರಯೋಜನ ಹಂಚಿಕೆ', 'ಎನ್‌ಬಿಎ',
    'பல்லுயிர்', 'உயிரியல் வளம்', 'நன்மை பகிர்வு', 'என்பிஏ',
    'జీవవైవిధ్యం', 'జీవ వనరులు', 'ప్రయోజన భాగస్వామ్యం', 'ఎన్‌బీఏ',
    'जैव विविधता', 'जैविक संसाधन', 'लाभ साझाकरण', 'एनबीए',
    'জীববৈচিত্র্য', 'জৈব সম্পদ', 'જૈવવિવિધતા', 'ਜੈਵ ਵਿਭਿੰਨਤਾ', 'ଜୈବବିବିଧତା',
    'حیاتیاتی تنوع', 'حیاتیاتی وسائل'
  ].some((kw) => cleanQ.includes(kw.toLowerCase()));

  const isFssai = [
    'fssai', 'aahar', 'dietary', 'food', 'ayurveda aahar',
    'ಆಹಾರ', 'ಆಯುರ್ವೇದ ಆಹಾರ', 'உணவு', 'ఆహార', 'आहार', 'आयुर्वेद आहार'
  ].some((kw) => cleanQ.includes(kw.toLowerCase()));

  const isRegulation = [
    'regulation', 'rule 158', '158b', 'schedule t', 'license', 'ayush', 'manufactur', 'gmp',
    'ಆಯುಷ್', 'ಪರವಾನಗಿ', 'ನಿಯಮಾವಳಿ', 'ನಿಯಮ 158b', 'ಜಿಎಂಪಿ',
    'ஆயுஷ்', 'உரிமம்', 'ஒழுங்குமுறை', 'விதி 158b',
    'ఆయుష్', 'లైసెన్స్', 'నియంత్రణ', 'నిబంధన 158b',
    'आयुष', 'लाइसेंस', 'विनियमन', 'नियम 158b', 'जीएमपी',
    'আয়ুষ', 'লাইসেন্স', 'ਨਿਯਮ 158b', 'لائسنس', 'ضابطہ'
  ].some((kw) => cleanQ.includes(kw.toLowerCase()));

  const isGi = [
    'gi', 'geographical', 'origin', 'saffron', 'cardamom', 'darjeeling',
    'ಭೌಗೋಳಿಕ ಸೂಚ್ಯಂಕ', 'ಭೌಗೋಳಿಕ', 'ಜಿಐ', 'புவிசார் குறியீடு', 'ஜிஐ',
    'భౌగోళిక సూచిక', 'జిఐ', 'भौगोलिक उपदर्शन', 'भौगोलिक संकेत', 'जीआई',
    'ভৌগোলিক নির্দেশক', 'جغرافیائی اشاریہ'
  ].some((kw) => cleanQ.includes(kw.toLowerCase()));

  const isTk = [
    'traditional knowledge', 'tkdl', 'prior art', 'neem', 'turmeric', 'samhita', 'treatise', 'classical',
    'ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನ', 'ಸಂಹಿತಾ', 'ಶಾಸ್ತ್ರೀಯ', 'ಭಾರತೀಯ ಪದ್ಧತಿ',
    'பாரம்பரிய அறிவு', 'சம்ஹிதை', 'சாஸ்திர',
    'సంప్రదాయ జ్ఞానం', 'సంహిత', 'శాస్త్రీయ ಗ್ರంథం',
    'पारंपरिक ज्ञान', 'संहिता', 'ग्रंथ', 'टीकेडीएल',
    'ঐতিহ্যগত জ্ঞান', 'সংহিতা', 'روایتی علم'
  ].some((kw) => cleanQ.includes(kw.toLowerCase()));

  const isCase = ['case', 'my', 'ashwagandha', 'medhya', 'ಅಶ್ವಗಂಧ', 'அஸ்வகந்தா', 'అశ్వగంధ', 'अश्वगंधा', 'অশ্বগন্ধা'].some((kw) => cleanQ.includes(kw));

  const isTrademark = [
    'trademark', 'brand', 'logo', 'class 5', 'brand name',
    'ಟ್ರೇಡ್‌ಮಾರ್ಕ್', 'ಬ್ರಾಂಡ್', 'ಮುದ್ರೆ', 'வர்த்தக முத்திரை', 'பிராண்ட்',
    'ట్రేడ్‌మార్క్', 'ట్రేడ్ మార్క్', 'ट्रेडमार्क', 'ब्रांड', 'व्यापार चिह्न',
    'ট্রেডমার্ক', 'ٹریڈ مارک'
  ].some((kw) => cleanQ.includes(kw.toLowerCase()));

  if (isPatent) {
    detectedIntent = 'PATENT';
    stream = 'Intellectual Property / Patent Law';
    confidence = 0.95;
  } else if (isAbs) {
    detectedIntent = 'ABS';
    stream = 'Biological Diversity & Access and Benefit Sharing';
    confidence = 0.96;
  } else if (isFssai) {
    detectedIntent = 'REGULATION';
    stream = 'Food Safety & Standards (Ayurveda Aahar)';
    confidence = 0.94;
  } else if (isRegulation) {
    detectedIntent = 'REGULATION';
    stream = 'AYUSH Regulatory Framework (D&C Act 1940)';
    confidence = 0.93;
  } else if (isGi) {
    detectedIntent = 'GI';
    stream = 'Geographical Indications of Goods';
    confidence = 0.92;
  } else if (isTk) {
    detectedIntent = 'TRADITIONAL_KNOWLEDGE';
    stream = 'Traditional Knowledge & Prior-Art Defense';
    confidence = 0.95;
  } else if (isCase) {
    detectedIntent = 'CASE';
    stream = 'User Innovation Cases';
    confidence = 0.88;
  } else if (isTrademark) {
    detectedIntent = 'TRADEMARK';
    stream = 'Trade Marks & Brand Protection';
    confidence = 0.91;
  }

  // Grouped search outputs
  const ipPathways: { title: string; subtitle: string; link: string; badge: string }[] = [];
  const evidence: Citation[] = [];
  const relatedFrameworks: { title: string; authority: string; link: string }[] = [];
  const priorArtChecklist: string[] = [];
  const matchedCases: { id: string; title: string; status: string; link: string }[] = [];

  // Match user cases
  userCases.forEach((c) => {
    if (c.title.toLowerCase().includes(cleanQ) || cleanQ.includes(c.title.toLowerCase().split(' ')[0])) {
      matchedCases.push({
        id: c.id,
        title: c.title,
        status: c.status,
        link: `/cases/${c.id}`,
      });
    }
  });

  // Intent-driven results synthesis
  switch (detectedIntent) {
    case 'PATENT':
      ipPathways.push({
        title: 'Section 3(p) Traditional Knowledge Bar Assessment',
        subtitle: 'Determine whether your formulation requires technical synergy data to overcome Section 3(p).',
        link: '/cases/new',
        badge: 'Statutory Exclusion',
      });
      ipPathways.push({
        title: 'Biological Origin Disclosure (Section 10(4)(ii)(D))',
        subtitle: 'Mandatory declaration of Indian biological sourcing in complete patent specifications.',
        link: '/cases/new',
        badge: 'Mandatory Disclosure',
      });
      evidence.push(makeCitation('PATENTS_ACT_SEC_3P', 'Direct statutory bar for traditional medicine polyherbal compositions.'));
      evidence.push(makeCitation('PATENTS_ACT_SEC_3E', 'Prohibition of mere admixtures with only additive properties.'));
      evidence.push(makeCitation('PATENTS_ACT_SEC_10_4', 'Disclosure of source and geographical origin of biological material.'));
      relatedFrameworks.push({ title: 'Biological Diversity Act Section 6 (NBA Approval for Patents)', authority: 'NBA India', link: '/explore' });
      relatedFrameworks.push({ title: 'TKDL Classification System for Prior Art', authority: 'CSIR-AYUSH', link: '/explore' });
      priorArtChecklist.push('Search CSIR-AYUSH Traditional Knowledge Digital Library (TKDL) for ingredient monographs.');
      priorArtChecklist.push('Perform IPC cross-search in classes A61K 36/00 (Medicinal plant preparations).');
      priorArtChecklist.push('Obtain Form III approval from National Biodiversity Authority prior to patent grant.');
      break;

    case 'ABS':
      ipPathways.push({
        title: 'NBA Form III Approval for Patent Applications',
        subtitle: 'Required before grant of any IPR based on Indian biological resources.',
        link: '/cases/new',
        badge: 'Section 6 BDA',
      });
      evidence.push(makeCitation('BIOLOGICAL_DIVERSITY_SEC_7', 'Mandatory prior intimation to State Biodiversity Board for commercial use.'));
      evidence.push(makeCitation('BIOLOGICAL_DIVERSITY_SEC_6', 'Mandatory NBA approval prior to intellectual property grant.'));
      relatedFrameworks.push({ title: 'State Biodiversity Board (SBB) Form I Guidelines', authority: 'State Biodiversity Boards', link: '/explore' });
      relatedFrameworks.push({ title: 'National Biodiversity Authority Benefit Sharing Guidelines', authority: 'NBA', link: '/explore' });
      priorArtChecklist.push('Ascertain whether botanical species is cultivated by registered farmers or wild-harvested from forest zones.');
      priorArtChecklist.push('Verify state-specific benefit-sharing percentages (typically 0.1% to 0.5% ex-factory value).');
      break;

    case 'REGULATION':
      evidence.push(makeCitation('DRUGS_COSMETICS_RULE_158B', 'Licensing rules for Ayurvedic Proprietary Medicines.'));
      evidence.push(makeCitation('DRUGS_COSMETICS_SCHEDULE_T', 'Good Manufacturing Practices (GMP) for Ayurvedic drugs.'));
      evidence.push(makeCitation('FSSAI_AYURVEDA_AAHAR_REG_3_8', 'Food Safety and Standards (Ayurveda Aahar) Regulations 2022.'));
      relatedFrameworks.push({ title: 'Rule 158B Evidence Dossier Format', authority: 'Ministry of AYUSH', link: '/explore' });
      relatedFrameworks.push({ title: 'FSSAI Ayurveda Aahar Special Expert Committee', authority: 'FSSAI', link: '/explore' });
      priorArtChecklist.push('Check Ayurvedic Pharmacopoeia of India (API) monographs for permissible heavy metal limits.');
      priorArtChecklist.push('Confirm that product labels strictly omit disease cure claims if applying under Ayurveda-Aahar.');
      break;

    case 'TRADITIONAL_KNOWLEDGE':
      evidence.push(makeCitation('PATENTS_ACT_SEC_3P', 'Section 3(p) exclusion based on traditional knowledge records.'));
      relatedFrameworks.push({ title: 'TKDL Prior Art Digital Library', authority: 'CSIR & Ministry of AYUSH', link: '/explore' });
      relatedFrameworks.push({ title: 'First Schedule Treatises of Drugs & Cosmetics Act', authority: 'Ministry of AYUSH', link: '/explore' });
      priorArtChecklist.push('Cross-reference Charaka Samhita, Sushruta Samhita, and Ashtanga Hridaya for classical indications.');
      priorArtChecklist.push('Assess whether the proposed formulation modifies classical ratios or uses modern extraction solvents.');
      break;

    default:
      evidence.push(makeCitation('PATENTS_ACT_SEC_3P', 'General statutory bar on traditional herbal formulations.'));
      evidence.push(makeCitation('DRUGS_COSMETICS_RULE_158B', 'Ayurvedic proprietary medicine licensing framework.'));
      relatedFrameworks.push({ title: 'Overview of Indian IP & AYUSH Regulations', authority: 'IP-SAKTI Sahayak', link: '/explore' });
      priorArtChecklist.push('Review Formulation DNA against classical treatises and patent databases.');
      break;
  }

  return {
    query,
    detectedIntent,
    stream,
    confidence,
    groups: {
      ipPathways,
      evidence,
      relatedFrameworks,
      priorArtChecklist,
      cases: matchedCases,
    },
  };
}
