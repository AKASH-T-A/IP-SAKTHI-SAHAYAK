with open('frontend/src/lib/intelligence/search.ts', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if any('\u0900' <= c <= '\u097F' for c in line):
            print(f"{i+1}: {line.strip()[:100]}".encode('ascii', 'backslashreplace').decode('ascii'))
