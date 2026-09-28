/**
 * IP-SAKTI Sahayak — Automated Hardcoded User-Facing String Detector
 * SIH26045
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendSrc = path.resolve(__dirname, '../frontend/src');

const IGNORE_PATTERNS = [
  /^[a-z0-9_-]+$/i,                       // single simple identifiers
  /^\/[a-zA-Z0-9_\-\/]*$/,                 // route paths / URLs
  /^https?:\/\//,                          // full URLs
  /^var\(--/,                              // CSS variables
  /^rgba?\(.*?\)/,                         // CSS colors
  /^#[0-9a-fA-F]{3,8}$/,                   // hex colors
  /^[0-9]+(\.[0-9]+)?(px|rem|em|%|vh|vw|ms|s)?$/, // CSS sizes
  /^(GET|POST|PUT|DELETE|PATCH)$/,          // HTTP methods
  /^(Section 3\(p\)|Rule 158B|Form III|Schedule T|Patents Act, 1970|Biological Diversity Act, 2002)$/, // canonical legal IDs
  /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)?$/, // translation keys e.g. nav.home
];

const SCAN_DIRS = [
  path.join(frontendSrc, 'app'),
  path.join(frontendSrc, 'components'),
];

function getAllFiles(dir, exts = ['.tsx', '.ts']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, exts));
    } else {
      const ext = path.extname(file);
      if (exts.includes(ext) && !file.endsWith('.d.ts')) {
        results.push(filePath);
      }
    }
  }
  return results;
}

const files = SCAN_DIRS.flatMap((d) => getAllFiles(d));

console.log('============================================================');
console.log('IP-SAKTI SAHAYAK — HARDCODED STRING AUDIT');
console.log('============================================================\n');

let totalSuspects = 0;
const fileSummary = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  const relPath = path.relative(frontendSrc, file);

  let fileSuspects = 0;
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
    if (trimmed.includes('import ') || trimmed.includes("from '") || trimmed.includes('from "')) return;
    if (trimmed.includes('console.')) return;

    // Look for JSX text between > and <
    const jsxTextMatches = line.match(/>([^<>{]+)</g);
    if (jsxTextMatches) {
      for (const m of jsxTextMatches) {
        const text = m.substring(1, m.length - 1).trim();
        if (
          text.length > 2 &&
          /[a-zA-Z]/.test(text) &&
          !IGNORE_PATTERNS.some((p) => p.test(text)) &&
          !text.includes('&nbsp;') &&
          !text.startsWith('©')
        ) {
          fileSuspects++;
        }
      }
    }
  });

  if (fileSuspects > 0) {
    fileSummary.push({ path: relPath, count: fileSuspects });
    totalSuspects += fileSuspects;
  }
}

fileSummary.sort((a, b) => b.count - a.count);

console.log('File                                                Suspect UI Strings');
console.log('----------------------------------------------------------------------');
for (const item of fileSummary) {
  console.log(`${item.path.padEnd(52)} ${item.count}`);
}
console.log('----------------------------------------------------------------------');
console.log(`Total Files with Hardcoded Strings: ${fileSummary.length}`);
console.log(`Total Flagged Hardcoded UI Strings: ${totalSuspects}\n`);
