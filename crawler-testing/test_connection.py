import requests
import ssl
import socket
import urllib.request

URL = "https://api.myscheme.gov.in/schemes/v6/public/schemes?limit=10&lang=en"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'x-api-key': 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://www.myscheme.gov.in/'
}

print(f"Testing URL: {URL}")

# Method 1: requests
print("\n--- Method 1: requests ---")
try:
    s = requests.Session()
    response = s.get(URL, headers=HEADERS, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")
    print(f"Content length: {len(response.content)}")
except Exception as e:
    print(f"Requests Error: {e}")

# Method 2: urllib
print("\n--- Method 2: urllib ---")
try:
    req = urllib.request.Request(URL, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=10) as response:
        print(f"Status: {response.status}")
        print(f"Content length: {len(response.read())}")
except Exception as e:
    print(f"Urllib Error: {e}")

# Method 3: Socket test (Check if port 443 is open)
print("\n--- Method 3: Socket ---")
try:
    hostname = "api.myscheme.gov.in"
    context = ssl.create_default_context()
    with socket.create_connection((hostname, 443)) as sock:
        with context.wrap_socket(sock, server_hostname=hostname) as ssock:
            print(f"Successfully connected to {hostname}:443 over SSL")
            print(f"Cipher: {ssock.cipher()}")
except Exception as e:
    print(f"Socket Error: {e}")
