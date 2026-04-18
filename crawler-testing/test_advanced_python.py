import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.ssl_ import create_urllib3_context

# Custom SSL Context to allow legacy ciphers (sometimes helps)
class LegacyAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        context = create_urllib3_context()
        context.set_ciphers('DEFAULT@SECLEVEL=1') # Lower security level to allow more ciphers
        kwargs['ssl_context'] = context
        return super(LegacyAdapter, self).init_poolmanager(*args, **kwargs)

URL = "https://api.myscheme.gov.in/schemes/v6/public/schemes?limit=10&lang=en"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'x-api-key': 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.myscheme.gov.in/',
    'Origin': 'https://www.myscheme.gov.in',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site'
}

print(f"Testing with enhanced headers and custom SSL adapter...")

session = requests.Session()
session.mount('https://', LegacyAdapter())

try:
    response = session.get(URL, headers=HEADERS, timeout=15)
    print(f"Status: {response.status_code}")
    print(f"Success! Content length: {len(response.content)}")
except Exception as e:
    print(f"Error: {e}")
