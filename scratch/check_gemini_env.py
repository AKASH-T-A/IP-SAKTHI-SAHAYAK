import os
print("GEMINI_API_KEY in os.environ?", "GEMINI_API_KEY" in os.environ)
if "GEMINI_API_KEY" in os.environ:
    val = os.environ["GEMINI_API_KEY"]
    print(f"Length of key: {len(val)}, starts with: {val[:4]}...")
