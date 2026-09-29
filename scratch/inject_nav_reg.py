import json
import re

translations_file = r"c:\Users\akash\OneDrive\Desktop\SAKTHI-SIH\frontend\src\i18n\translations\index.ts"

NEW_KEY = {
    "en": {"nav.regulations": "Regulations"},
    "kn": {"nav.regulations": "ನಿಯಮಾವಳಿಗಳು"},
    "hi": {"nav.regulations": "विनियम"},
    "ta": {"nav.regulations": "விதிமுறைகள்"},
    "te": {"nav.regulations": "నియంత్రణలు"},
    "ml": {"nav.regulations": "റെഗുലേഷനുകൾ"},
    "mr": {"nav.regulations": "विनियम"},
    "bn": {"nav.regulations": "প্রবিধান"},
    "gu": {"nav.regulations": "નિયમો"},
    "pa": {"nav.regulations": "ਨਿਯਮ"},
    "or": {"nav.regulations": "ନିୟମାବଳୀ"},
    "as": {"nav.regulations": "নিয়মাৱলী"},
    "ur": {"nav.regulations": "قوانین و ضوابط"},
    "sa": {"nav.regulations": "नियमाः"},
    "kok": {"nav.regulations": "विनियम"},
    "mai": {"nav.regulations": "विनियम"},
    "doi": {"nav.regulations": "विनियम"},
    "ks": {"nav.regulations": "قواعد و ضوابط"},
    "sd": {"nav.regulations": "قاعدا ۽ ضابطا"},
    "mni": {"nav.regulations": "রেগুলেসনশিং"},
    "brx": {"nav.regulations": "नेमखान्थि"},
    "sat": {"nav.regulations": "ᱱᱤᱭᱚᱢ ᱠᱚ"},
    "ne": {"nav.regulations": "विनियमहरू"}
}

with open(translations_file, 'r', encoding='utf-8') as fp:
    ts_content = fp.read()

dict_regex = re.compile(r"export const ([A-Z]+)_TRANSLATIONS: TranslationDict = (\{[\s\S]*?\n\});")

def replace_dict(match):
    lang_upper = match.group(1)
    lang_code = lang_upper.lower()
    raw_json = match.group(2)
    data = json.loads(raw_json)
    
    if lang_code in NEW_KEY:
        for k, v in NEW_KEY[lang_code].items():
            data[k] = v
        
    formatted_json = json.dumps(data, ensure_ascii=False, indent=2)
    return f"export const {lang_upper}_TRANSLATIONS: TranslationDict = {formatted_json};"

new_ts_content, count = dict_regex.subn(replace_dict, ts_content)

with open(translations_file, 'w', encoding='utf-8') as fp:
    fp.write(new_ts_content)

print(f"Updated nav.regulations in all {count} languages.")
