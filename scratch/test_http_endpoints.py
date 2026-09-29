import urllib.request

try:
    with urllib.request.urlopen('http://localhost:3000/assistant') as res:
        content = res.read().decode('utf-8')
        print(f"Assistant route: HTTP {res.status} | Content length: {len(content)}")
        print("Contains BHASHINI:", "BHASHINI" in content)
except Exception as e:
    print("Assistant route failed:", e)

try:
    with urllib.request.urlopen('http://localhost:3000/') as res:
        content = res.read().decode('utf-8')
        print(f"Home route: HTTP {res.status} | Content length: {len(content)}")
except Exception as e:
    print("Home route failed:", e)
