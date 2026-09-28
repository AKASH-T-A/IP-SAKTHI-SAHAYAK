with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    text = f.read()

# Replace any \\" with \"
text_fixed = text.replace(r'\"\"', r'\"').replace(r'\\"', r'\"')

with open('frontend/src/i18n/translations/index.ts', 'w', encoding='utf-8') as f:
    f.write(text_fixed)

print("Fixed escaped quotes, checking JSON validity now...")
