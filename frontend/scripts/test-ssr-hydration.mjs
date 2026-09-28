/**
 * IP-SAKTI Sahayak — SSR & Hydration Determinism Verification
 * SIH26045
 */
import assert from 'node:assert';

async function testSSR() {
  console.log('🧪 Testing SSR HTML Determinism across pages...\n');

  const pages = [
    '/',
    '/explore',
    '/search',
    '/cases',
    '/evidence',
    '/assistant',
    '/login',
    '/register'
  ];

  for (const page of pages) {
    const url = `http://localhost:3000${page}`;
    const res = await fetch(url);
    assert.strictEqual(res.status, 200, `Page ${page} must return 200 OK`);
    const html = await res.text();

    // Verify root html attributes
    assert.ok(html.includes('<html lang="en" dir="ltr"'), `Page ${page} must render <html lang="en" dir="ltr" on SSR`);
    
    // Verify Navbar renders deterministic English links during SSR
    if (page !== '/login' && page !== '/register') {
      assert.ok(html.includes('Home'), `Page ${page} must include 'Home' in Navbar on SSR`);
      assert.ok(html.includes('Explore'), `Page ${page} must include 'Explore' in Navbar on SSR`);
      assert.ok(html.includes('English'), `Page ${page} must include 'English' in LanguageSelector on SSR`);
    }

    console.log(`  ✓ ${page.padEnd(12)} -> 200 OK, SSR html lang="en" dir="ltr", deterministic English base`);
  }

  console.log('\n🎉 ALL SSR PAGES RENDER DETERMINISTIC ENGLISH ROOT MARKUP FOR SAFE HYDRATION!\n');
}

testSSR().catch((err) => {
  console.error('❌ SSR Verification failed:', err);
  process.exit(1);
});
