import requests
import json
import time
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.ssl_ import create_urllib3_context

# Custom SSL Context to allow legacy ciphers (sometimes helps)
class LegacyAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        context = create_urllib3_context()
        context.set_ciphers('DEFAULT@SECLEVEL=1') # Lower security level to allow more ciphers
        kwargs['ssl_context'] = context
        return super(LegacyAdapter, self).init_poolmanager(*args, **kwargs)

# Configuration
API_BASE = 'https://api.myscheme.gov.in/schemes/v6/public/schemes'
SEARCH_BASE = 'https://api.myscheme.gov.in/schemes/v6/public/search'
API_KEY = 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc'

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
    'Sec-Fetch-Site': 'same-site',
    'Content-Type': 'application/json'
}

def test_endpoint(session, url, method='GET', data=None, description=""):
    print(f"\n{'-'*60}")
    print(f"Testing: {description}")
    print(f"URL: {url}")
    print(f"Method: {method}")
    if data:
        print(f"Data: {json.dumps(data)}")

    try:
        if method == 'GET':
            response = session.get(url, headers=HEADERS, timeout=10)
        else:
            response = session.post(url, headers=HEADERS, json=data, timeout=10)

        print(f"Status Code: {response.status_code}")
        
        try:
            json_data = response.json()
            print(f"Response Preview: {json.dumps(json_data, indent=2)[:500]}...") 
            
            if response.status_code == 200:
                 # Check for various success patterns
                if 'data' in json_data:
                    data_content = json_data['data']
                    if isinstance(data_content, list):
                        print(f"✅ Success! Received a list of {len(data_content)} items.")
                        return data_content
                    elif isinstance(data_content, dict):
                         if 'schemes' in data_content:
                             print(f"✅ Success! Received a dict with 'schemes'. Count: {len(data_content['schemes'])}")
                             return data_content['schemes']
                         elif 'items' in data_content:
                             print(f"✅ Success! Received a dict with 'items'. Count: {len(data_content['items'])}")
                             return data_content['items']
                         elif 'hits' in data_content:
                             print(f"✅ Success! Received a dict with 'hits'.")
                             return data_content['hits']
                
                if isinstance(json_data, list):
                     print(f"✅ Success! Received a root list of {len(json_data)} items.")
                     return json_data
            
        except json.JSONDecodeError:
            print("❌ Response is not valid JSON.")
            print(f"Body: {response.text[:200]}")

    except Exception as e:
        print(f"❌ Error: {e}")

    return None

def main():
    print("🚀 Starting API Exploration (Enhanced)...")
    
    session = requests.Session()
    session.mount('https://', LegacyAdapter())

    # 1. Try Search Endpoint (Most likely candidate for listing)
    print("\n🔍 Testing Search Endpoint...")
    search_payload = {
        "text": "",
        "tags": [],
        "states": [],
        "ministeries": [],
        "categories": [],
        "page": 1,
        "size": 20,
        "sort": "recent",
        "lang": "en"
    }
    
    result = test_endpoint(session, SEARCH_BASE, 'POST', search_payload, "Search POST - Empty Query")
    if result:
         print("🎉 Search endpoint works! We can use this to iterate.")
         with open('results/api_discovery_search.json', 'w') as f:
            json.dump(result, f, indent=2)
         return

    # 2. Try standard list endpoints
    endpoints_to_test = [
        (f"{API_BASE}?limit=10&lang=en", "GET", None, "Standard Limit"),
        (f"{API_BASE}/all?lang=en", "GET", None, "/all endpoint"),
        (f"{API_BASE}?page=1&limit=10&lang=en", "GET", None, "Pagination params"),
    ]

    for url, method, data, desc in endpoints_to_test:
        result = test_endpoint(session, url, method, data, desc)
        if result:
            print("🎉 Found a working list endpoint!")
            with open('results/api_discovery_sample.json', 'w') as f:
                json.dump(result, f, indent=2)
            return
        time.sleep(1)

if __name__ == "__main__":
    main()
