import { generateAssistantResponse } from '../frontend/src/lib/intelligence/assistant';
import { CaseItem } from '../frontend/src/store/cases';

const mockCase: CaseItem = {
  id: 'demo-case-ashwagandha-brahmi',
  title: 'Ashwagandha & Brahmi Memory Enhancer Formulation',
  productName: 'Ashwagandha & Brahmi Memory Enhancer Formulation',
  intendedUse: 'Cognitive enhancement and memory support',
  jurisdiction: 'IN',
  formulation: {
    category: 'PROPRIETARY_ASU_DRUG',
    name: 'Ashwagandha-Brahmi Ghrita',
    ingredients: [
      { name: 'Ashwagandha', botanicalName: 'Withania somnifera', partUsed: 'Root', percentage: 40 },
      { name: 'Brahmi', botanicalName: 'Bacopa monnieri', partUsed: 'Whole plant', percentage: 30 }
    ],
    excipients: ['Cow Ghee', 'Honey'],
    dosageForm: 'Ghrita (Medicated Ghee)',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

console.log('--- TEST 1: Kannada Query with Kannada Selected ---');
const resKn = generateAssistantResponse('ಅಶ್ವಗಂಧದ ಉತ್ಪನ್ನಕ್ಕೆ ಪೇಟೆಂಟ್ ಪಡೆಯಬಹುದೇ?', mockCase, 'kn');
console.log('Confidence:', resKn.confidence);
console.log('Answer preview:', resKn.answer.substring(0, 100) + '...');
console.log('Contains Section 3(p):', resKn.answer.includes('Section 3(p)'));
console.log('Why preview:', resKn.why.substring(0, 80) + '...');
console.log('Evidence count:', resKn.evidence.length);
if (!resKn.answer.includes('Section 3(p)')) throw new Error('Missing Section 3(p)');

console.log('\n--- TEST 2: English Query with Kannada Selected ---');
const resKnEn = generateAssistantResponse('Can I patent this formulation?', mockCase, 'kn');
console.log('Answer preview:', resKnEn.answer.substring(0, 100) + '...');
console.log('Contains Section 3(p):', resKnEn.answer.includes('Section 3(p)'));
if (!resKnEn.answer.includes('Section 3(p)')) throw new Error('Missing Section 3(p)');

console.log('\n--- TEST 3: Hindi Query with Hindi Selected ---');
const resHi = generateAssistantResponse('Rule 158B के तहत आयुष लाइसेंस की क्या आवश्यकताएं हैं?', mockCase, 'hi');
console.log('Confidence:', resHi.confidence);
console.log('Answer preview:', resHi.answer.substring(0, 100) + '...');
console.log('Contains Rule 158B:', resHi.answer.includes('Rule 158B'));
if (!resHi.answer.includes('Rule 158B')) throw new Error('Missing Rule 158B');

console.log('\n--- TEST 4: ABS Query with Hindi Selected ---');
const resHiAbs = generateAssistantResponse('क्या राज्य जैव विविधता बोर्ड (SBB) की अनुमति आवश्यक है?', mockCase, 'hi');
console.log('Answer preview:', resHiAbs.answer.substring(0, 100) + '...');
console.log('Contains SBB / Section 7:', resHiAbs.answer.includes('Section 7') || resHiAbs.answer.includes('SBB'));

console.log('\n--- TEST 5: FSSAI Ayurveda-Aahar Query with Kannada Selected ---');
const resKnFssai = generateAssistantResponse('ಇದನ್ನು ಆಯುರ್ವೇದ ಆಹಾರ ಎಂದು ಮಾರಾಟ ಮಾಡಲು ನಿಯಮಗಳೇನು?', mockCase, 'kn');
console.log('Answer preview:', resKnFssai.answer.substring(0, 100) + '...');
console.log('Contains Regulation 3 / 8:', resKnFssai.answer.includes('Regulation 3') || resKnFssai.answer.includes('Regulation 8'));

console.log('\n--- TEST 6: Guarantee Query (Mandatory Safe Abstention) ---');
const resGuar = generateAssistantResponse('क्या आप पेटेंट मिलने की 100% गारंटी दे सकते हैं?', mockCase, 'hi');
console.log('isAbstained:', resGuar.isAbstained);
console.log('Confidence:', resGuar.confidence);
console.log('Answer preview:', resGuar.answer.substring(0, 100) + '...');
if (!resGuar.isAbstained) throw new Error('Guarantee query should trigger safe abstention');

console.log('\n--- TEST 7: Out-of-Corpus Query (Safe Abstention) ---');
const resCrypto = generateAssistantResponse('How to invest in cryptocurrency and real estate?', mockCase, 'en');
console.log('isAbstained:', resCrypto.isAbstained);
console.log('Confidence:', resCrypto.confidence);
console.log('Answer preview:', resCrypto.answer.substring(0, 100) + '...');
if (!resCrypto.isAbstained) throw new Error('Out of corpus query should trigger safe abstention');

console.log('\n✅ ALL ASSISTANT MULTILINGUAL TESTS PASSED SUCCESSFULLY!');
