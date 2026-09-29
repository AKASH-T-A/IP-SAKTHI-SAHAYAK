import httpx

with httpx.Client(base_url='http://localhost:8000') as client:
    res = client.get('/api/v1/regulatory/international-regimes')
    assert res.status_code == 200
    data = res.json()
    print('Supported Markets:', data['supported_markets'])
    for p in data['pathways']:
        print(f"* Market: {p['market']:25} | Framework: {p['regulatory_framework'][:40]}... | IP Treaties: {', '.join(p['ip_treaties'])}")
