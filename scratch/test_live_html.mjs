import http from 'node:http';

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Fetching live Home page from Next.js server http://localhost:3000...');
  const res = await fetchUrl('http://localhost:3000');
  console.log(`Status: ${res.status}, Body length: ${res.body.length}`);

  // Check if body has any raw Devanagari (Hindi) outside of language selector
  // Let's find any Devanagari in the body
  const devanagariMatches = res.body.match(/[\u0900-\u097F]+/g) || [];
  console.log(`Devanagari character groups found in SSR HTML: ${devanagariMatches.length}`);
  
  // What are those Devanagari words?
  const uniqueDev = [...new Set(devanagariMatches)];
  console.log('Unique Devanagari tokens in SSR HTML:');
  for (const t of uniqueDev) {
    console.log(`  - "${t}"`);
  }
}

run().catch(console.error);
