import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/i18n/translations/index.ts', 'r', encoding='utf-8') as f:
    c = f.read()

m = re.search(r'export const EN_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});', c)
en = json.loads(m.group(1))

print("=== REGULATORY KEYS ===")
for k in sorted(en):
    if 'regulat' in k.lower():
        print(f"  {k}: {en[k]}")
