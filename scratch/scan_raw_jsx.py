import re

with open('frontend/src/app/(main)/page.tsx', encoding='utf-8') as f:
    text = f.read()

text_clean = re.sub(r'{\/\*[\s\S]*?\*\/}', '', text)

matches = re.finditer(r'>\s*([^{}<>]+?)\s*<', text_clean)
found = []
for m in matches:
    content = m.group(1).strip()
    if content and not content.startswith('//') and not content.startswith('/*'):
        if any(c.isalnum() for c in content):
            found.append(content)

print(f"Total text nodes found: {len(found)}")
for item in set(found):
    print("  RAW NODE:", repr(item).encode('ascii', 'backslashreplace').decode('ascii'))
