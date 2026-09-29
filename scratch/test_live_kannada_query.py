import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "http://127.0.0.1:8000/api/v1/assistant/query"
payload = {
    "query": "ಅಶ್ವಗಂಧ ಮತ್ತು ಬ್ರಾಹ್ಮಿಯನ್ನು ಒಳಗೊಂಡ ಸೂತ್ರೀಕರಣಕ್ಕೆ ಪೇಟೆಂಟ್ ಪಡೆಯಲು ಸಾಧ್ಯವೇ?",
    "language": "kn",
    "case_context": {
        "title": "ಅಶ್ವಗಂಧ ಬ್ರಾಹ್ಮಿ ಸಂಯೋಜನೆ",
        "ingredients": [{"name": "Withania somnifera"}, {"name": "Bacopa monnieri"}]
    }
}

resp = requests.post(url, json=payload)
print(f"Status Code: {resp.status_code}")
data = resp.json()
print("Detected Intent:", data.get("detected_intent"))
print("Abstained:", data.get("abstained"))
print("Language:", data.get("language"))
print("Answer:", data.get("answer"))
print("Why:", data.get("why"))
print("Practical Meaning:", data.get("practical_meaning"))
print("Citations Count:", len(data.get("citations", [])))
for idx, c in enumerate(data.get("citations", [])):
    print(f"  [{idx+1}] {c.get('short_title')} § {c.get('section')} ({c.get('authority')})")
print("Next Actions:", data.get("next_actions"))
