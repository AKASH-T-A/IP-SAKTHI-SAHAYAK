import re
import json

with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    text = f.read()

dict_regex = re.compile(r'export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});')

for m in dict_regex.finditer(text):
    lang = m.group(1)
    raw_json = m.group(2)
    try:
        data = json.loads(raw_json)
        # print(f"{lang}: OK ({len(data)} keys)")
    except Exception as e:
        print(f"FAILED {lang}: {e}")
        # Print lines around the error
        lines = raw_json.splitlines()
        # Find position if possible
        err_msg = str(e)
        m_pos = re.search(r'line (\d+) column (\d+)', err_msg)
        if m_pos:
            err_line = int(m_pos.group(1))
            print(f"Error around line {err_line}:")
            for idx in range(max(0, err_line - 3), min(len(lines), err_line + 3)):
                print(f"  {idx+1}: {lines[idx].encode('ascii', 'backslashreplace').decode('ascii')}")
