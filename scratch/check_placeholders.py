# -*- coding: utf-8 -*-
import os
import re
import json

ROOT = "frontend/src"
PLACEHOLDER_REGEX = re.compile(r'placeholder=["\']([^"{}\n]+)["\']')

found = []
for dirpath, _, filenames in os.walk(ROOT):
    for f in filenames:
        if not f.endswith(".tsx"):
            continue
        p = os.path.join(dirpath, f)
        with open(p, "r", encoding="utf-8") as file:
            c = file.read()
        for m in PLACEHOLDER_REGEX.finditer(c):
            v = m.group(1)
            if v not in ["you@example.com", "••••••••"]:
                found.append({"file": p.replace("\\", "/"), "val": v})

with open("scratch/unlocalized_placeholders.json", "w", encoding="utf-8") as f:
    json.dump(found, f, indent=2)

print(f"Found {len(found)} unlocalized placeholders.")
for item in found:
    print(f"  {item['file']}: {item['val']}")
