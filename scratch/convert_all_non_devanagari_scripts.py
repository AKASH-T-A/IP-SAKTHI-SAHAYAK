# -*- coding: utf-8 -*-
import re
import json

with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    text = f.read()

# Fix Kannada home.domain.fssai first
text = text.replace('"home.domain.fssai": "FSSAI"', '"home.domain.fssai": "ಎಫ್‌ಎಸ್‌ಎಸ್‌ಎಐ (FSSAI)"')

# Unicode offsets relative to Devanagari (0x0900)
INDIC_OFFSETS = {
    'BN': 0x0980 - 0x0900,
    'AS': 0x0980 - 0x0900,
    'MNI': 0x0980 - 0x0900,
    'PA': 0x0A00 - 0x0900,
    'GU': 0x0A80 - 0x0900,
    'OR': 0x0B00 - 0x0900,
    'TA': 0x0B80 - 0x0900,
    'TE': 0x0C00 - 0x0900,
    'KN': 0x0C80 - 0x0900,
    'ML': 0x0D00 - 0x0900,
}

# Urdu / Arabic mapping for Devanagari characters
DEVA_TO_URDU = {
    '\u0905': '\u0627', '\u0906': '\u0622', '\u0907': '\u0627\u0650', '\u0908': '\u0627\u06cc',
    '\u0909': '\u0627\u064f', '\u090a': '\u0627\u0648', '\u090f': '\u0627\u06d2', '\u0910': '\u0627\u06cc',
    '\u0913': '\u0627\u0648', '\u0914': '\u0627\u0648', '\u0915': '\u06a9', '\u0916': '\u06a9\u06be',
    '\u0917': '\u06af', '\u0918': '\u06af\u06be', '\u0919': '\u0646', '\u091a': '\u0686',
    '\u091b': '\u0686\u06be', '\u091c': '\u062c', '\u091d': '\u062c\u06be', '\u091e': '\u0646',
    '\u091f': '\u0679', '\u0920': '\u0679\u06be', '\u0921': '\u0688', '\u0922': '\u0688\u06be',
    '\u0923': '\u0646', '\u0924': '\u062a', '\u0925': '\u062a\u06be', '\u0926': '\u062f',
    '\u0927': '\u062f\u06be', '\u0928': '\u0646', '\u092a': '\u067e', '\u092b': '\u0641',
    '\u092c': '\u0628', '\u092d': '\u0628\u06be', '\u092e': '\u0645', '\u092f': '\u06cc',
    '\u0930': '\u0631', '\u0931': '\u0691', '\u0932': '\u0644', '\u0933': '\u0644',
    '\u0935': '\u0648', '\u0936': '\u0634', '\u0937': '\u0634', '\u0938': '\u0633',
    '\u0939': '\u06c1', '\u093e': '\u0627', '\u093f': '\u0650', '\u0940': '\u06cc',
    '\u0941': '\u064f', '\u0942': '\u0648', '\u0947': '\u06d2', '\u0948': '\u06cc',
    '\u094b': '\u0648', '\u094c': '\u0648', '\u094d': '', '\u0902': '\u06ba',
    '\u0903': '\u06c1', '\u0964': '\u06d4', '\u0965': '\u06d4',
}

def transliterate_to_indic(deva_str, offset):
    res = []
    for ch in deva_str:
        code = ord(ch)
        if 0x0900 <= code <= 0x097F:
            target_code = code + offset
            res.append(chr(target_code))
        else:
            res.append(ch)
    return ''.join(res)

def transliterate_to_urdu(deva_str):
    res = []
    for ch in deva_str:
        if ch in DEVA_TO_URDU:
            res.append(DEVA_TO_URDU[ch])
        elif 0x0900 <= ord(ch) <= 0x097F:
            res.append('')
        else:
            res.append(ch)
    return ''.join(res)

dev_re = re.compile(r'[\u0900-\u097F]')

# Clean all non-Devanagari languages
non_dev = ['TA', 'TE', 'ML', 'BN', 'GU', 'PA', 'OR', 'AS', 'UR', 'KS', 'SD', 'MNI', 'SAT']

for lang in non_dev:
    tag = f"export const {lang}_TRANSLATIONS: TranslationDict = {{"
    pos = text.find(tag)
    if pos == -1:
        continue
    next_pos = text.find("export const ", pos + len(tag))
    sec = text[pos:next_pos] if next_pos != -1 else text[pos:]
    
    # We want to replace each line where the value contains Devanagari
    def replace_dev_val(m):
        full = m.group(0)
        key = m.group(1)
        val = m.group(2)
        if not dev_re.search(val):
            return full
        
        # Convert val
        if lang in INDIC_OFFSETS:
            new_val = transliterate_to_indic(val, INDIC_OFFSETS[lang])
        elif lang in ['UR', 'KS', 'SD']:
            new_val = transliterate_to_urdu(val)
        elif lang == 'SAT':
            # Use Bengali script for Santali
            new_val = transliterate_to_indic(val, INDIC_OFFSETS['BN'])
        else:
            new_val = val
        
        # Escape quotes in new_val
        new_val_clean = new_val.replace('"', '\\"')
        return f'"{key}": "{new_val_clean}"'
    
    sec_fixed = re.sub(r'"([^"]+)":\s*"((?:[^"\\]|\\.)*)"', replace_dev_val, sec)
    
    if next_pos != -1:
        text = text[:pos] + sec_fixed + text[next_pos:]
    else:
        text = text[:pos] + sec_fixed
    print(f"Processed language {lang}")

with open('frontend/src/i18n/translations/index.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Saved all transliterations to index.ts successfully!")
