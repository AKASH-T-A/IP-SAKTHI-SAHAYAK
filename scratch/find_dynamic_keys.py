import os
import re

src_dir = r"c:\Users\akash\OneDrive\Desktop\SAKTHI-SIH\frontend\src"

dynamic_calls = []

# match t(...)
t_call_pattern = re.compile(r"""\bt\(\s*([^)]+)\)""")

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                for line_no, line in enumerate(fp, 1):
                    for match in t_call_pattern.finditer(line):
                        arg = match.group(1).strip()
                        # If not starting with quote or if template string
                        if not (arg.startswith("'") or arg.startswith('"')):
                            dynamic_calls.append((f, line_no, arg))
                        elif arg.startswith('`'):
                            dynamic_calls.append((f, line_no, arg))

print(f"Dynamic t(...) calls found: {len(dynamic_calls)}")
for f, l, a in dynamic_calls:
    print(f"{f}:{l} -> t({a})")
