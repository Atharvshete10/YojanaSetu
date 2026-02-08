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

URL = "https://api.myscheme.gov.in/schemes/v6/public/schemes?limit=10&lang=en"

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'x-api-key': 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc'
}

print(f"Testing GET: {URL}")
session = requests.Session()
session.mount('https://', LegacyAdapter())

try:
    response = session.get(URL, headers=HEADERS, timeout=10)
    print(f"Status: {response.status_code}")
    print("Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
