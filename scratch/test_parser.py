import json
import re

translations_file = r"c:\Users\akash\OneDrive\Desktop\SAKTHI-SIH\frontend\src\i18n\translations\index.ts"

with open(translations_file, 'r', encoding='utf-8') as fp:
    ts_content = fp.read()

# Verify that all 23 language dictionaries are present and match
dict_regex = re.compile(r"export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});")
matches = list(dict_regex.finditer(ts_content))
print(f"Matched {len(matches)} dictionaries")

for m in matches:
    lang = m.group(1).lower()
    try:
        data = json.loads(m.group(2))
        print(f"Successfully parsed {lang} with {len(data)} keys")
    except Exception as e:
        print(f"Failed parsing {lang}: {e}")
