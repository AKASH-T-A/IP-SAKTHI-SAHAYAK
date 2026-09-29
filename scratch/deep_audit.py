import os
import re
import json

src_dir = r"c:\Users\akash\OneDrive\Desktop\SAKTHI-SIH\frontend\src"
translations_file = r"c:\Users\akash\OneDrive\Desktop\SAKTHI-SIH\frontend\src\i18n\translations\index.ts"

with open(translations_file, 'r', encoding='utf-8', errors='ignore') as fp:
    ts_content = fp.read()

dict_regex = re.compile(r"export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});")
en_dict = {}
for m in dict_regex.finditer(ts_content):
    if m.group(1).lower() == 'en':
        en_dict = json.loads(m.group(2))
        break

# Find all string literals in .ts / .tsx files that look like a translation key (e.g. word.word or word.word.word)
key_candidate_pattern = re.compile(r"""['"]([a-z][a-zA-Z0-9_]*\.[a-zA-Z0-9_.-]+)['"]""")

all_candidates = set()
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                for match in key_candidate_pattern.finditer(fp.read()):
                    cand = match.group(1)
                    # Filter out file extensions like .ts, .json, css classes, url paths
                    if not any(cand.endswith(ext) for ext in ['.ts', '.tsx', '.json', '.mjs', '.png', '.svg', '.css', '.js']):
                        if not '/' in cand and not '\\' in cand and not cand.startswith('http'):
                            all_candidates.add(cand)

print(f"Total potential translation keys in frontend/src: {len(all_candidates)}")

# Test potential keys against EN dict
present = [k for k in all_candidates if k in en_dict]
missing = [k for k in all_candidates if k not in en_dict]

print(f"Keys present in EN dictionary: {len(present)}")
print(f"Keys NOT in EN dictionary: {len(missing)}")

# Filter out obvious false positives like css modules, package names, api paths
real_missing_keys = []
for k in sorted(missing):
    # Check if looks like a legitimate i18n key: starts with nav, home, common, wizard, case, regulatory, auth, report, admin, explore, search, claim, evidence, intel, voice, assistant, international
    prefixes = ('nav.', 'home.', 'common.', 'wizard.', 'case.', 'cases.', 'regulatory.', 'auth.', 'report.', 'admin.', 'explore.', 'search.', 'claim.', 'claims.', 'evidence.', 'intel.', 'voice.', 'assistant.', 'international.', 'intents.', 'action.', 'labelReview.')
    if any(k.startswith(p) for p in prefixes):
        real_missing_keys.append(k)

print(f"\nReal missing keys matching standard i18n prefixes ({len(real_missing_keys)}):")
for k in real_missing_keys:
    print(f"  - {k}")
