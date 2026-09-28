# -*- coding: utf-8 -*-
"""
Helper to update index.ts language dictionaries
"""
import json
import re

INDEX_PATH = "frontend/src/i18n/translations/index.ts"

def update_language_dict(lang_code: str, updates: dict):
    lang_upper = lang_code.upper()
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = rf"export const {lang_upper}_TRANSLATIONS: TranslationDict = (\{{[\s\S]*?\n\}});"
    match = re.search(pattern, content)
    if not match:
        raise ValueError(f"Could not find {lang_upper}_TRANSLATIONS in {INDEX_PATH}")

    curr_dict = json.loads(match.group(1))
    curr_dict.update(updates)

    new_dict_str = json.dumps(curr_dict, ensure_ascii=False, indent=2)
    new_export = f"export const {lang_upper}_TRANSLATIONS: TranslationDict = {new_dict_str};"

    new_content = content[:match.start()] + new_export + content[match.end():]
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)

    print(f"Successfully updated {len(updates)} keys for {lang_upper}!")

if __name__ == "__main__":
    print("Updater module loaded.")
