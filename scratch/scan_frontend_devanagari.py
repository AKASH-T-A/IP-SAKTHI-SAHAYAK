import os
import re

src_dir = 'frontend/src'
devanagari_re = re.compile(r'[\u0900-\u097F]')
results = []

for root, dirs, files in os.walk(src_dir):
    if 'node_modules' in root or '.next' in root:
        continue
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            path = os.path.join(root, f)
            with open(path, encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
            
            # Check for Devanagari in code (outside index.ts or other dicts)
            if 'i18n' not in path:
                dev_matches = devanagari_re.findall(content)
                if dev_matches:
                    results.append((path, len(dev_matches), "Devanagari found outside i18n"))

print("=== SCAN FOR DEVANAGARI OUTSIDE I18N ===")
for path, count, msg in results:
    print(f"  {path}: {count} chars ({msg})")
