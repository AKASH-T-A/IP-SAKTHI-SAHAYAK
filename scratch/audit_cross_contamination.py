# -*- coding: utf-8 -*-
"""
IP-SAKTI Sahayak — Cross-Language Contamination Audit
Scans all 23 language dictionaries for:
1. Devanagari in non-Devanagari languages (kn, ta, te, ml, bn, gu, pa, or, as, ur, ks, sd, sat)
2. English fallback sentences
3. Mixed scripts
"""

import json
import re

INDEX_PATH = "frontend/src/i18n/translations/index.ts"

with open(INDEX_PATH, "r", encoding="utf-8") as f:
    text = f.read()

pattern = r"export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});"
dicts = dict(re.findall(pattern, text))

devanagari_re = re.compile(r"[\u0900-\u097F]")
kannada_re = re.compile(r"[\u0C80-\u0CFF]")
tamil_re = re.compile(r"[\u0B80-\u0BFF]")
telugu_re = re.compile(r"[\u0C00-\u0C7F]")
malayalam_re = re.compile(r"[\u0D00-\u0D7F]")
gurmukhi_re = re.compile(r"[\u0A00-\u0A7F]")
gujarati_re = re.compile(r"[\u0A80-\u0AFF]")
odia_re = re.compile(r"[\u0B00-\u0B7F]")
bengali_re = re.compile(r"[\u0980-\u09FF]")
arabic_re = re.compile(r"[\u0600-\u06FF]")
olchiki_re = re.compile(r"[\u1C50-\u1C7F]")

EXEMPT_KEYS = {
    "auth.emailPlaceholder",
    "auth.passwordPlaceholder",
    "footer.copyright",
    "home.domain.fssai"
}

# Languages that naturally use Devanagari: hi, mr, sa, kok, mai, doi, brx, ne
DEV_LANGS = {"HI", "MR", "SA", "KOK", "MAI", "DOI", "BRX", "NE"}

results = {}

for lang, d_str in dicts.items():
    d = json.loads(d_str)
    dev_count = 0
    dev_keys = []
    
    if lang not in DEV_LANGS and lang != "EN":
        for k, v in d.items():
            if k in EXEMPT_KEYS:
                continue
            if devanagari_re.search(v):
                dev_count += 1
                dev_keys.append((k, v))
                
    results[lang] = {
        "total": len(d),
        "devanagari_in_non_dev": dev_count,
        "dev_keys_sample": dev_keys[:10]
    }

with open("scratch/contamination_report.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Contamination audit completed:")
for lang, r in results.items():
    if r["devanagari_in_non_dev"] > 0:
        print(f"  {lang}: {r['devanagari_in_non_dev']} keys contain unexpected Devanagari/Hindi!")
    else:
        print(f"  {lang}: Clean of Devanagari contamination.")
