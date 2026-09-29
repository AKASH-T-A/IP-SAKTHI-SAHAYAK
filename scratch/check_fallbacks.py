import json
import re

translations_file = r"c:\Users\akash\OneDrive\Desktop\SAKTHI-SIH\frontend\src\i18n\translations\index.ts"
with open(translations_file, 'r', encoding='utf-8', errors='ignore') as fp:
    ts_content = fp.read()

dict_regex = re.compile(r"export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});")
dictionaries = {}
for m in dict_regex.finditer(ts_content):
    lang = m.group(1).lower()
    dictionaries[lang] = json.loads(m.group(2))

en_dict = dictionaries['en']

for lang, d in dictionaries.items():
    if lang == 'en':
        continue
    missing = [k for k in en_dict if k not in d]
    empty = [k for k in en_dict if d.get(k) == ""]
    same_as_en = [k for k in en_dict if d.get(k) == en_dict[k] and en_dict[k] != "" and not any(p in en_dict[k] for p in ['Section 3(p)', 'Rule 158B', 'Form III', 'Schedule T', 'Patents Act'])]
    if missing or empty or len(same_as_en) < 20:
        print(f"Lang {lang}: Missing={len(missing)}, Empty={len(empty)}, Same as EN={len(same_as_en)}")
        if lang == 'kn':
            print("KN keys same as EN:")
            for k in same_as_en[:15]:
                print(f"  {k}: {d.get(k)}")

# Also inspect check-translations.mjs fallback keys
