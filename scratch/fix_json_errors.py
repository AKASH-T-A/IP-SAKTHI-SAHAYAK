# -*- coding: utf-8 -*-
import re
import json

with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    text = f.read()

# Let's fix the corrupted sec3pText lines across all dictionaries:
# Find any line with "home.evidence.sec3pText": "..."...an invention
def fix_sec3p(m):
    key = m.group(1)
    val = m.group(2)
    # clean out any trailing duplicated quotes
    # Just keep the native text with Section 3(p)
    return f'"{key}": "{val}",'

# Let's directly replace any line that has double quotes in the middle:
# e.g. "home.evidence.sec3pText": "Section 3(p): \"...\"\"...an invention...\"",
clean_lines = []
for line in text.splitlines():
    if '"home.evidence.sec3pText":' in line:
        # Extract the native translation or keep clean
        # Match "home.evidence.sec3pText": "([^\"]*?)"
        m = re.search(r'"home\.evidence\.sec3pText":\s*"([^"]*(?:\\.[^"]*)*)"', line)
        if m:
            clean_val = m.group(1)
            # If it has duplicated "...an invention which", remove it
            if '""...an invention' in clean_val:
                clean_val = clean_val.split('""...an invention')[0]
            if '\\"\\"\\"...an invention' in clean_val:
                clean_val = clean_val.split('\\"\\"\\"...an invention')[0]
            clean_lines.append(f'  "home.evidence.sec3pText": "{clean_val}",')
        else:
            clean_lines.append(line)
    else:
        clean_lines.append(line)

text_fixed = "\n".join(clean_lines)

with open('frontend/src/i18n/translations/index.ts', 'w', encoding='utf-8') as f:
    f.write(text_fixed)

print("Fixed sec3p lines, checking JSON validity now...")
