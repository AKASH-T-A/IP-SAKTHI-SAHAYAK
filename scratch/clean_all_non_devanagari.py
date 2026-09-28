# -*- coding: utf-8 -*-
import re
import json

with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    text = f.read()

# Fix Kannada home.domain.fssai first
text = text.replace('"home.domain.fssai": "FSSAI"', '"home.domain.fssai": "ಎಫ್‌ಎಸ್‌ಎಸ್‌ಎಐ (FSSAI)"')

# Let's extract EN dictionary
en_start = text.find("export const EN_TRANSLATIONS: TranslationDict = {")
en_end = text.find("export const HI_TRANSLATIONS: TranslationDict = {")
en_sec = text[en_start:en_end]
en_dict = dict(re.findall(r'"([^"]+)":\s*"((?:[^"\\]|\\.)*)"', en_sec))

dev_re = re.compile(r'[\u0900-\u097F]')

# List of non-devanagari languages
non_dev = ['ta', 'te', 'ml', 'bn', 'gu', 'pa', 'or', 'as', 'ur', 'ks', 'sd', 'mni', 'sat']

# Language script prefixes / markers
SCRIPT_NAME_MAP = {
    'ta': 'தமிழ்',
    'te': 'తెలుగు',
    'ml': 'മലയാളം',
    'bn': 'বাংলা',
    'gu': 'ગુજરાતી',
    'pa': 'ਪੰਜਾਬੀ',
    'or': 'ଓଡ଼ିଆ',
    'as': 'অসমীয়া',
    'ur': 'اردو',
    'ks': 'کٲشُر',
    'sd': 'سنڌي',
    'mni': 'মৈতৈলোন্',
    'sat': 'ᱥᱟᱱᱛᱟᱲᱤ',
}

# For any contaminated key in a non-Devanagari language, replace Devanagari text with native script
# Let's see: we can map the 131 most common keys to proper native translations:
# For example:
# home.hero.multilingual -> native
# home.demo.story -> native
# wizard.* -> native
print("Inspecting contaminated keys across non-dev languages...")
for lang in non_dev:
    tag = f"export const {lang.upper()}_TRANSLATIONS: TranslationDict = {{"
    pos = text.find(tag)
    if pos == -1:
        continue
    next_pos = text.find("export const ", pos + len(tag))
    sec = text[pos:next_pos] if next_pos != -1 else text[pos:]
    
    # Find all keys with devanagari in this section
    matches = list(re.finditer(r'"([^"]+)":\s*"((?:[^"\\]|\\.)*)"', sec))
    contam = [m.group(1) for m in matches if dev_re.search(m.group(2))]
    print(f"  {lang.upper()}: {len(contam)} contaminated keys")

