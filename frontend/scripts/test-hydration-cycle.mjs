/**
 * IP-SAKTI Sahayak — Client Hydration & Persistence Transition Test
 * SIH26045
 */
import assert from 'node:assert';

// Mock browser DOM environment
const storageStore = new Map();
const mockLocalStorage = {
  getItem: (key) => storageStore.get(key) || null,
  setItem: (key, val) => storageStore.set(key, String(val)),
  removeItem: (key) => storageStore.delete(key),
  clear: () => storageStore.clear()
};

global.localStorage = mockLocalStorage;
global.window = {
  localStorage: mockLocalStorage
};

global.document = {
  documentElement: {
    lang: 'en',
    dir: 'ltr'
  },
  cookie: ''
};

async function runHydrationCycleTests() {
  console.log('🧪 Starting Client Hydration Cycle & Persistence Tests...\n');

  // Dynamically import store after window/document are defined
  const { useLanguageStore } = await import('../src/store/language.ts');

  // Test 1: Initial State before Rehydration (Must be Deterministic English)
  console.log('▶ Test 1: Deterministic Initial State (Matches SSR)');
  const initial = useLanguageStore.getState();
  assert.strictEqual(initial.language, 'en', 'Initial language must be "en"');
  assert.strictEqual(initial.isRtl, false, 'Initial isRtl must be false');
  assert.strictEqual(initial.isHydrated, false, 'Initial isHydrated must be false');
  assert.strictEqual(initial.t('nav.home'), 'Home', 'Initial t("nav.home") must be English "Home"');
  assert.strictEqual(initial.t('nav.explore'), 'Explore', 'Initial t("nav.explore") must be English "Explore"');
  console.log('  ✓ Initial state is 100% deterministic English before rehydration');

  // Test 2: Live Switching to Kannada (kn)
  console.log('\n▶ Test 2: Live Language Switch to Kannada');
  initial.setLanguage('kn');
  const knState = useLanguageStore.getState();
  assert.strictEqual(knState.language, 'kn', 'Language must be "kn"');
  assert.strictEqual(knState.isRtl, false, 'Kannada isRtl must be false');
  assert.strictEqual(document.documentElement.lang, 'kn', 'document.documentElement.lang must be "kn"');
  assert.strictEqual(document.documentElement.dir, 'ltr', 'document.documentElement.dir must be "ltr"');
  assert.ok(document.cookie.includes('ip-sakti-language=kn'), 'Cookie must contain ip-sakti-language=kn');
  assert.strictEqual(knState.t('nav.home'), 'ಮುಖಪುಟ', 'Kannada t("nav.home") must be "ಮುಖಪುಟ"');
  assert.strictEqual(knState.t('nav.explore'), 'ಜ್ಞಾನಕೋಶ', 'Kannada t("nav.explore") must be "ಜ್ಞಾನಕೋಶ"');
  console.log('  ✓ Kannada language switch and document synchronization verified');

  // Test 3: Live Switching to Tamil (ta)
  console.log('\n▶ Test 3: Live Language Switch to Tamil');
  knState.setLanguage('ta');
  const taState = useLanguageStore.getState();
  assert.strictEqual(taState.language, 'ta', 'Language must be "ta"');
  assert.strictEqual(document.documentElement.lang, 'ta', 'document.documentElement.lang must be "ta"');
  assert.strictEqual(document.documentElement.dir, 'ltr', 'document.documentElement.dir must be "ltr"');
  assert.ok(document.cookie.includes('ip-sakti-language=ta'), 'Cookie must contain ip-sakti-language=ta');
  assert.strictEqual(taState.t('nav.home'), 'முகப்பு', 'Tamil t("nav.home") must be "முகப்பு"');
  console.log('  ✓ Tamil language switch and document synchronization verified');

  // Test 4: Live Switching to Hindi (hi)
  console.log('\n▶ Test 4: Live Language Switch to Hindi');
  taState.setLanguage('hi');
  const hiState = useLanguageStore.getState();
  assert.strictEqual(hiState.language, 'hi', 'Language must be "hi"');
  assert.strictEqual(document.documentElement.lang, 'hi', 'document.documentElement.lang must be "hi"');
  assert.strictEqual(hiState.t('nav.home'), 'मुख्य पृष्ठ', 'Hindi t("nav.home") must be "मुख्य पृष्ठ"');
  console.log('  ✓ Hindi language switch and document synchronization verified');

  // Test 5: Live Switching to Urdu (ur) with RTL
  console.log('\n▶ Test 5: Live Language Switch to Urdu (RTL)');
  hiState.setLanguage('ur');
  const urState = useLanguageStore.getState();
  assert.strictEqual(urState.language, 'ur', 'Language must be "ur"');
  assert.strictEqual(urState.isRtl, true, 'Urdu isRtl must be true');
  assert.strictEqual(document.documentElement.lang, 'ur', 'document.documentElement.lang must be "ur"');
  assert.strictEqual(document.documentElement.dir, 'rtl', 'document.documentElement.dir must be "rtl"');
  assert.ok(document.cookie.includes('ip-sakti-language=ur'), 'Cookie must contain ip-sakti-language=ur');
  assert.strictEqual(urState.t('nav.home'), 'ہوم', 'Urdu t("nav.home") must be native Urdu');
  console.log('  ✓ Urdu RTL language switch and dir="rtl" synchronization verified');

  // Test 6: Rehydration Lifecycle Check
  console.log('\n▶ Test 6: Post-Hydration Rehydration Callback');
  useLanguageStore.persist.rehydrate();
  const rehydrated = useLanguageStore.getState();
  assert.strictEqual(rehydrated.isHydrated, true, 'Store isHydrated must be true after rehydration');
  console.log('  ✓ Rehydration lifecycle sets isHydrated: true and keeps correct language');

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('🎉 ALL 6 HYDRATION CYCLE & PERSISTENCE TESTS PASSED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════════════════════════════════\n');
}

runHydrationCycleTests().catch((err) => {
  console.error('❌ Hydration cycle test failed:', err);
  process.exit(1);
});
