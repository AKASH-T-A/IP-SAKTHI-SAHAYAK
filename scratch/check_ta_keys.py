# -*- coding: utf-8 -*-
import re

with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    text = f.read()

# Let's see what keys are contaminated in TA
ta_start = text.find("export const TA_TRANSLATIONS: TranslationDict = {")
ta_end = text.find("export const TE_TRANSLATIONS: TranslationDict = {")
ta_sec = text[ta_start:ta_end]

dev_re = re.compile(r'[\u0900-\u097F]')
contaminated_keys = []
for m in re.finditer(r'"([^"]+)":\s*"((?:[^"\\]|\\.)*)"', ta_sec):
    k, v = m.group(1), m.group(2)
    if dev_re.search(v):
        contaminated_keys.append(k)

print(f"Total contaminated keys in TA: {len(contaminated_keys)}")
print("Sample contaminated keys:", contaminated_keys[:10])
