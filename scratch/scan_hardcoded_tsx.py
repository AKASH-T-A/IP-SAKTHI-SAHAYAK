# -*- coding: utf-8 -*-
"""
Scan frontend/src/**/*.tsx for suspicious hardcoded user-facing English strings
"""

import os
import re

SUSPICIOUS_REGEX = re.compile(r'>\s*([A-Z][a-zA-Z0-9 ,.\-\?!\'\"]{3,50})\s*<')
PLACEHOLDER_REGEX = re.compile(r'placeholder=["\']([^"{}\n]+)["\']')

ROOT = "frontend/src"
found_text = []
found_placeholders = []

for dirpath, _, filenames in os.walk(ROOT):
    for f in filenames:
        if not f.endswith(".tsx"):
            continue
        p = os.path.join(dirpath, f)
        with open(p, "r", encoding="utf-8") as file:
            content = file.read()

        # Check placeholders
        for match in PLACEHOLDER_REGEX.finditer(content):
            val = match.group(1)
            if not val.startswith("{") and not "t(" in val and len(val.strip()) > 1:
                # ignore email and password dot placeholders if canonical
                if val not in ["you@example.com", "••••••••"]:
                    found_placeholders.append((p, val))

        # Check suspicious text in JSX
        for match in SUSPICIOUS_REGEX.finditer(content):
            val = match.group(1).strip()
            # ignore technical tokens, code blocks, or single words like SVG, HTML, etc.
            if val in ["Section 3(p)", "Rule 158B", "Form III", "Schedule T", "AYUSH", "FSSAI", "TKDL", "NBA", "IP-SAKTI", "SIH26045"]:
                continue
            if re.match(r'^[A-Z0-9_]+$', val):
                continue
            found_text.append((p, val))

print(f"Scanned {ROOT}:")
print(f"Hardcoded placeholders: {len(found_placeholders)}")
for p, val in found_placeholders[:20]:
    print(f"  {os.path.basename(p)}: {val}")

print(f"\nSuspicious JSX texts: {len(found_text)}")
for p, val in found_text[:30]:
    print(f"  {os.path.basename(p)}: {val}")
