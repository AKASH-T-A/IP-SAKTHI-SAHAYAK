import os
import re
import json

src_dir = r"c:\Users\akash\OneDrive\Desktop\SAKTHI-SIH\frontend\src"
translations_file = r"c:\Users\akash\OneDrive\Desktop\SAKTHI-SIH\frontend\src\i18n\translations\index.ts"

# 1. Extract all keys used in code
used_keys = set()

# Regex patterns for t('key'), t("key"), titleKey: 'key', etc.
t_pattern = re.compile(r"""\bt\(\s*['"]([a-zA-Z0-9_.-]+)['"]""")
key_attr_pattern = re.compile(r"""\b(?:titleKey|descKey|tagKey|labelKey|hintKey|subKey|termKey|nameKey)\s*:\s*['"]([a-zA-Z0-9_.-]+)['"]""")

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
                for match in t_pattern.finditer(content):
                    used_keys.add(match.group(1))
                for match in key_attr_pattern.finditer(content):
                    used_keys.add(match.group(1))

print(f"Total keys referenced in code: {len(used_keys)}")

# 2. Extract dictionaries from index.ts
with open(translations_file, 'r', encoding='utf-8', errors='ignore') as fp:
    ts_content = fp.read()

dict_regex = re.compile(r"export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});")
dictionaries = {}
for m in dict_regex.finditer(ts_content):
    lang = m.group(1).lower()
    try:
        dictionaries[lang] = json.loads(m.group(2))
    except Exception as e:
        print(f"Error parsing JSON for {lang}: {e}")

print(f"Found {len(dictionaries)} dictionaries: {list(dictionaries.keys())}")

en_dict = dictionaries.get('en', {})
print(f"EN dictionary has {len(en_dict)} keys")

# 3. Check which used keys are missing from EN
missing_from_en = sorted([k for k in used_keys if k not in en_dict])
print(f"\nKeys used in code but MISSING from canonical EN ({len(missing_from_en)}):")
for k in missing_from_en:
    print(f"  - {k}")

# 4. Check for each language, which keys are missing from that language's dictionary
print("\n" + "="*80)
print(f"{'Lang':<6} | {'Total':<6} | {'Missing from Code':<18} | {'Missing from EN':<16}")
print("-" * 80)
for lang, d in dictionaries.items():
    missing_code = len([k for k in used_keys if k not in d])
    missing_en = len([k for k in en_dict if k not in d])
    print(f"{lang:<6} | {len(d):<6} | {missing_code:<18} | {missing_en:<16}")

# Specifically check kn
kn_dict = dictionaries.get('kn', {})
missing_from_kn = sorted([k for k in used_keys if k not in kn_dict])
print(f"\nKeys used in code but MISSING from KN ({len(missing_from_kn)}):")
for k in missing_from_kn:
    print(f"  - {k}")
