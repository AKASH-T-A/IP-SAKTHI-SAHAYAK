import re
from collections import defaultdict

with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    text = f.read()

# Split into language dictionaries
langs = ['EN', 'HI', 'KN', 'TA', 'TE', 'ML', 'MR', 'BN', 'GU', 'PA', 'OR', 'AS', 'UR', 'SA', 'KOK', 'MAI', 'DOI', 'KS', 'SD', 'MNI', 'BRX', 'SAT', 'NE']
devanagari_langs = {'HI', 'MR', 'SA', 'KOK', 'MAI', 'DOI', 'BRX', 'NE'}

dev_re = re.compile(r'[\u0900-\u097F]')

lang_dicts = {}
for i, lang in enumerate(langs):
    start_tag = f"export const {lang}_TRANSLATIONS: TranslationDict = {{"
    if i < len(langs) - 1:
        next_tag = f"export const {langs[i+1]}_TRANSLATIONS: TranslationDict = {{"
        sec = text[text.find(start_tag):text.find(next_tag)]
    else:
        sec = text[text.find(start_tag):text.find("export const MASTER_DICTIONARY")]
    
    entries = dict(re.findall(r'"([^"]+)":\s*"([^"]*)"', sec))
    lang_dicts[lang] = entries

print("Checking key contamination across non-Devanagari languages:")
key_contam_count = defaultdict(int)
for lang, entries in lang_dicts.items():
    if lang in devanagari_langs:
        continue
    for k, v in entries.items():
        if dev_re.search(v):
            key_contam_count[k] += 1

print(f"Total distinct contaminated keys: {len(key_contam_count)}")
print("Sample 15 most contaminated keys:")
for k, count in sorted(key_contam_count.items(), key=lambda x: -x[1])[:15]:
    print(f"  {k} (contaminated in {count} languages)")
