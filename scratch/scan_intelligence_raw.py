import os
import re

dir_path = 'frontend/src/components/intelligence'
pattern_raw = re.compile(r'>\s*([^{}<>]+?)\s*<')

for fname in os.listdir(dir_path):
    if not fname.endswith('.tsx'):
        continue
    fpath = os.path.join(dir_path, fname)
    with open(fpath, encoding='utf-8') as f:
        content = f.read()
    
    clean = re.sub(r'{\/\*[\s\S]*?\*\/}', '', content)
    matches = pattern_raw.findall(clean)
    
    raw_nodes = []
    for m in matches:
        text = m.strip()
        if text and not text.startswith('//') and not text.startswith('/*'):
            # Filter out non-alphanumeric or single symbols
            if any(c.isalnum() for c in text):
                raw_nodes.append(text)
    
    if raw_nodes:
        print(f"=== {fname} ({len(raw_nodes)} raw nodes) ===")
        for n in sorted(list(set(raw_nodes))):
            print(f"  {repr(n).encode('ascii', 'backslashreplace').decode('ascii')}")
