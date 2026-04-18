import requests
import json
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.ssl_ import create_urllib3_context

class LegacyAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        context = create_urllib3_context()
        context.set_ciphers('DEFAULT@SECLEVEL=1')
        kwargs['ssl_context'] = context
        return super(LegacyAdapter, self).init_poolmanager(*args, **kwargs)

SLUG = "pmmy"
URL = f"https://api.myscheme.gov.in/schemes/v6/public/schemes?slug={SLUG}&lang=en"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'x-api-key': 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc'
}

print(f"Testing basic scheme fetch: {SLUG}")
session = requests.Session()
session.mount('https://', LegacyAdapter())

try:
    response = session.get(URL, headers=HEADERS, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Response keys: {data.keys()}")
        if 'data' in data:
            print("✅ Success! Got scheme data.")
            print(f"Scheme ID: {data['data'].get('_id')}")
        else:
             print("⚠️  Got 200 but no data key.")
             print(response.text[:200])
    else:
        print("❌ Request failed.")
        print(response.text[:200])

except Exception as e:
    print(f"Error: {e}")
