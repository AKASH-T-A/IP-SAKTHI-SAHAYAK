with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if '"home.evidence.sec3pText":' in l:
        print(f"Line {i+1}: {repr(l.strip())}")
