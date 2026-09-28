import re

# Load the file
with open('frontend/src/i18n/translations/index.ts', encoding='utf-8') as f:
    content = f.read()

# New keys dictionary for EN, HI, KN
NEW_KEYS = {
    'EN': {
        'home.evidence.actName': 'The Patents Act, 1970',
        'home.evidence.sec3pText': 'Section 3(p): "...an invention which, in effect, is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not patentable."',
        'home.multilingual.activeLanguage': 'English (Full Support)',
        'home.multilingual.schedule8': '22 Official Languages',
        'home.multilingual.isolationTitle': 'True Language Isolation',
        'home.multilingual.isolationDesc': 'Zero mixed-language UI or cross-language contamination',
    },
    'HI': {
        'home.evidence.actName': 'द पेटेंट्स एक्ट, 1970',
        'home.evidence.sec3pText': 'Section 3(p): "...एक ऐसा आविष्कार जो वास्तव में पारंपरिक ज्ञान है या जो पारंपरिक रूप से ज्ञात घटक या घटकों के ज्ञात गुणों का एकत्रीकरण या दोहराव है, पेटेंट योग्य नहीं है।"',
        'home.multilingual.activeLanguage': 'हिंदी (पूर्ण समर्थन)',
        'home.multilingual.schedule8': '22 आधिकारिक भाषाएँ',
        'home.multilingual.isolationTitle': 'सख्त भाषा पृथक्करण',
        'home.multilingual.isolationDesc': 'बिना किसी भाषाई मिश्रण के पूर्ण स्थानीयकरण',
    },
    'KN': {
        'home.evidence.actName': 'ದಿ ಪೇಟೆಂಟ್ಸ್ ಆಕ್ಟ್, 1970',
        'home.evidence.sec3pText': 'Section 3(p): "...ಸಾಂಪ್ರದಾಯಿಕ ಜ್ಞಾನವಾಗಿರುವ ಅಥವಾ ಸಾಂಪ್ರದಾಯಿಕವಾಗಿ ತಿಳಿದಿರುವ ಘಟಕಗಳ ತಿಳಿದ ಗುಣಲಕ್ಷಣಗಳ ಒಟ್ಟುಗೂಡಿಸುವಿಕೆ ಅಥವಾ ನಕಲು ಆಗಿರುವ ಆವಿಷ್ಕಾರವು ಪೇಟೆಂಟ್ ಪಡೆಯಲು ಅರ್ಹವಲ್ಲ."',
        'home.multilingual.activeLanguage': 'ಕನ್ನಡ (ಪೂರ್ಣ ಬೆಂಬಲ)',
        'home.multilingual.schedule8': '22 ಅಧಿಕೃತ ಭಾಷೆಗಳು',
        'home.multilingual.isolationTitle': 'ಶುದ್ಧ ಭಾಷಾ ಪ್ರತ್ಯೇಕತೆ',
        'home.multilingual.isolationDesc': 'ಯಾವುದೇ ಭಾಷಾ ಮಿಶ್ರಣವಿಲ್ಲದ ಸಮಗ್ರ ಸ್ಥಳೀಕರಣ',
    },
    'TA': {
        'home.evidence.actName': 'காப்புரிமைச் சட்டம், 1970',
        'home.evidence.sec3pText': 'Section 3(p): "...பாரம்பரிய அறிவாக இருக்கும் அல்லது பாரம்பரியமாக அறியப்பட்ட கூறுகளின் பண்புகளின் நகலாக இருக்கும் ஒரு கண்டுபிடிப்பு காப்புரிமை பெறத்தக்கது அல்ல."',
        'home.multilingual.activeLanguage': 'தமிழ் (முழு ஆதரவு)',
        'home.multilingual.schedule8': '22 அதிகாரப்பூர்வ மொழிகள்',
        'home.multilingual.isolationTitle': 'தூய மொழி தனிமைப்படுத்தல்',
        'home.multilingual.isolationDesc': 'எந்த மொழி கலப்பும் இல்லாத முழுமையான உள்ளூர்மயமாக்கல்',
    },
    'TE': {
        'home.evidence.actName': 'పేటెంట్ల చట్టం, 1970',
        'home.evidence.sec3pText': 'Section 3(p): "...సాంప్రదాయ పరిజ్ఞానంగా ఉన్న లేదా తెలిసిన భాగాల లక్షణాల కలయికగా ఉన్న ఆవిష్కరణ పేటెంట్ పొందేందుకు అర్హత లేదు."',
        'home.multilingual.activeLanguage': 'తెలుగు (పూర్తి మద్దతు)',
        'home.multilingual.schedule8': '22 అధికారిక భాషలు',
        'home.multilingual.isolationTitle': 'భాషా వివిక్తత',
        'home.multilingual.isolationDesc': 'ఏ ఇతర భాషా మిశ్రమం లేని పూర్తి స్థానికీకరణ',
    },
    'ML': {
        'home.evidence.actName': 'പേറ്റന്റ് നിയമം, 1970',
        'home.evidence.sec3pText': 'Section 3(p): "...പരമ്പരാഗത അറിവായതോ പരമ്പരാഗതമായി അറിയപ്പെടുന്ന ഘടകങ്ങളുടെ ഗുണങ്ങളുടെ സംയോജനമോ ആയ ഒരു കണ്ടുപിടുത്തത്തിന് പേറ്റന്റ് ലഭ്യമല്ല."',
        'home.multilingual.activeLanguage': 'മലയാളം (പൂർണ്ണ പിന്തുണ)',
        'home.multilingual.schedule8': '22 ഔദ്യോഗിക ഭാഷകൾ',
        'home.multilingual.isolationTitle': 'ശുദ്ധമായ ഭാഷാ ഒറ്റപ്പെടുത്തൽ',
        'home.multilingual.isolationDesc': 'മറ്റ് ഭാഷാ മിശ്രണമില്ലാത്ത സമ്പൂർണ്ണ പ്രാദേശികവൽക്കരണം',
    },
    'MR': {
        'home.evidence.actName': 'पेटंट कायदा, 1970',
        'home.evidence.sec3pText': 'Section 3(p): "...पारंपारिक ज्ञान असणारा किंवा पारंपारिक घटकांच्या ज्ञात गुणधर्मांचे एकत्रीकरण असणारा शोध पेटंटपात्र नाही."',
        'home.multilingual.activeLanguage': 'मराठी (पूर्ण समर्थन)',
        'home.multilingual.schedule8': '22 अधिकृत भाषा',
        'home.multilingual.isolationTitle': 'सक्त भाषा पृथक्करण',
        'home.multilingual.isolationDesc': 'कोणत्याही भाषिक मिश्रणाशिवाय संपूर्ण स्थानिकीकरण',
    },
}

# For all languages not explicitly listed, provide appropriate defaults
langs = ['EN', 'HI', 'KN', 'TA', 'TE', 'ML', 'MR', 'BN', 'GU', 'PA', 'OR', 'AS', 'UR', 'SA', 'KOK', 'MAI', 'DOI', 'KS', 'SD', 'MNI', 'BRX', 'SAT', 'NE']

print("Injecting new keys into dictionaries...")
for l in langs:
    tag = f"export const {l}_TRANSLATIONS: TranslationDict = {{"
    pos = content.find(tag)
    if pos == -1:
        print(f"Warning: {l} tag not found!")
        continue
    
    # Get keys for this language or fallback to EN/HI
    if l in NEW_KEYS:
        kmap = NEW_KEYS[l]
    elif l in ['SA', 'KOK', 'MAI', 'DOI', 'BRX', 'NE']:
        kmap = NEW_KEYS['HI']
    else:
        # Create native or safe keys
        kmap = NEW_KEYS['EN']
    
    lines_to_add = []
    for k, v in kmap.items():
        # Check if key already in this section
        # Look ahead up to next export
        next_pos = content.find("export const ", pos + len(tag))
        section = content[pos:next_pos] if next_pos != -1 else content[pos:]
        if f'"{k}":' not in section:
            v_esc = v.replace('"', '\\"')
            lines_to_add.append(f'  "{k}": "{v_esc}",')
    
    if lines_to_add:
        insert_text = "\n" + "\n".join(lines_to_add)
        insert_pos = pos + len(tag)
        content = content[:insert_pos] + insert_text + content[insert_pos:]
        print(f"Added {len(lines_to_add)} keys to {l}_TRANSLATIONS")

with open('frontend/src/i18n/translations/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Saved updated index.ts successfully!")
