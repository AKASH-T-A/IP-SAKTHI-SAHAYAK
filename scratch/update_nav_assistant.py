import re

target = 'frontend/src/i18n/translations/index.ts'
with open(target, 'r', encoding='utf-8') as f:
    text = f.read()

new_text = re.sub(r'"nav\.assistant":\s*"[^"]+"', '"nav.assistant": "BHASHINI"', text)

with open(target, 'w', encoding='utf-8') as f:
    f.write(new_text)

print('Updated nav.assistant across all dictionaries.')
