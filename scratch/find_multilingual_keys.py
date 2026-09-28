with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    text = f.read()

en_start = text.find("export const EN_TRANSLATIONS: TranslationDict = {")
en_end = text.find("export const HI_TRANSLATIONS: TranslationDict = {")
en_section = text[en_start:en_end]

for line in en_section.splitlines():
    if 'home.multilingual' in line or 'multilingual' in line:
        print(line.strip())
