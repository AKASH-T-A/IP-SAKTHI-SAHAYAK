import os
import re
import json

translations_file = r"c:\Users\akash\OneDrive\Desktop\SAKTHI-SIH\frontend\src\i18n\translations\index.ts"
with open(translations_file, 'r', encoding='utf-8', errors='ignore') as fp:
    ts_content = fp.read()

dict_regex = re.compile(r"export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});")
en_dict = {}
for m in dict_regex.finditer(ts_content):
    if m.group(1).lower() == 'en':
        en_dict = json.loads(m.group(2))
        break

src_dir = r"c:\Users\akash\OneDrive\Desktop\SAKTHI-SIH\frontend\src"
key_candidate_pattern = re.compile(r"""['"]([a-z][a-zA-Z0-9_]*\.[a-zA-Z0-9_.-]+)['"]""")

all_candidates = set()
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                for match in key_candidate_pattern.finditer(fp.read()):
                    cand = match.group(1)
                    if not any(cand.endswith(ext) for ext in ['.ts', '.tsx', '.json', '.mjs', '.png', '.svg', '.css', '.js']):
                        if not '/' in cand and not '\\' in cand and not cand.startswith('http'):
                            all_candidates.add(cand)

missing = sorted([k for k in all_candidates if k not in en_dict])
print(f"All {len(missing)} missing items:")
for k in missing:
    print(f"  {k}")
