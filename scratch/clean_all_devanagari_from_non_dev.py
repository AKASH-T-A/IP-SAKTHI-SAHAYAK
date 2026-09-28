import re

with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    text = f.read()

# Non-devanagari languages
non_dev = ['KN', 'TA', 'TE', 'ML', 'BN', 'GU', 'PA', 'OR', 'AS', 'UR', 'KS', 'SD', 'MNI', 'SAT']
devanagari_re = re.compile(r'[\u0900-\u097F]')

# Extract EN translations as pristine base
en_start = text.find("export const EN_TRANSLATIONS: TranslationDict = {")
en_end = text.find("export const HI_TRANSLATIONS: TranslationDict = {")
en_dict = dict(re.findall(r'"([^"]+)":\s*"((?:[^"\\]|\\.)*)"', text[en_start:en_end]))

# For each non-dev language, find contaminated keys
total_cleaned = 0
for l in non_dev:
    if l == 'KN':
        continue # KN is already 100% clean
    tag = f"export const {l}_TRANSLATIONS: TranslationDict = {{"
    pos = text.find(tag)
    if pos == -1:
        continue
    next_pos = text.find("export const ", pos + len(tag))
    sec = text[pos:next_pos] if next_pos != -1 else text[pos:]
    
    entries = re.findall(r'(\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)",?)', sec)
    cleaned_sec = sec
    count = 0
    for full_line, k, v in entries:
        if devanagari_re.search(v):
            # Contaminated! Replace with clean version
            count += 1
            # If we have a clean translation or need clean text
            en_val = en_dict.get(k, k)
            new_line = f'  "{k}": "{en_val}",'
            cleaned_sec = cleaned_sec.replace(full_line, f'\n{new_line}', 1)
    
    if count > 0:
        print(f"Cleaned {count} contaminated keys in {l}_TRANSLATIONS")
        total_cleaned += count
        if next_pos != -1:
            text = text[:pos] + cleaned_sec + text[next_pos:]
        else:
            text = text[:pos] + cleaned_sec

with open('frontend/src/i18n/translations/index.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print(f"Total cleaned across all languages: {total_cleaned}")
