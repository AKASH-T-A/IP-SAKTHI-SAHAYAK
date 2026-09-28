import re

with open('frontend/src/app/(main)/page.tsx', encoding='utf-8') as f:
    page_text = f.read()

page_keys = set(re.findall(r"t\(['\"]([^'\"]+)['\"]\)", page_text))

with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    idx_text = f.read()

pattern = re.compile(r'"([^"]+)":\s*"((?:[^"\\]|\\.)*)"')

en_start = idx_text.find("export const EN_TRANSLATIONS: TranslationDict = {")
en_end = idx_text.find("export const HI_TRANSLATIONS: TranslationDict = {")
en_dict = dict(pattern.findall(idx_text[en_start:en_end]))

kn_start = idx_text.find("export const KN_TRANSLATIONS: TranslationDict = {")
kn_end = idx_text.find("export const TA_TRANSLATIONS: TranslationDict = {")
kn_dict = dict(pattern.findall(idx_text[kn_start:kn_end]))

devanagari_re = re.compile(r'[\u0900-\u097F]')
kannada_re = re.compile(r'[\u0C80-\u0CFF]')

print(f"Total keys used in page.tsx: {len(page_keys)}")
issues = 0
for k in sorted(page_keys):
    val = kn_dict.get(k, '')
    en_val = en_dict.get(k, '')
    has_dev = bool(devanagari_re.search(val))
    has_kn = bool(kannada_re.search(val))
    is_identical_en = (val == en_val)
    if has_dev or is_identical_en or not has_kn:
        print(f"  ISSUE in {k}:")
        print(f"    EN: {en_val}")
        print(f"    KN: {val.encode('ascii', 'backslashreplace').decode('ascii')}")
        print(f"    has_dev={has_dev}, has_kn={has_kn}, is_identical_en={is_identical_en}")
        issues += 1

print(f"Check completed: {issues} issues found.")
