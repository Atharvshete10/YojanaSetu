import subprocess
import json
import os
import re
import time
import xml.etree.ElementTree as ET

# Configuration
NODE_SCRIPT = 'crawler_core.js'
SITEMAP_URL = 'https://www.myscheme.gov.in/sitemap-0.xml'
RESULTS_DIR = 'results'

def run_node_command(args):
    """Executes the Node.js script and returns the output."""
    cmd = ['node', NODE_SCRIPT] + args
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')
        return result.stdout.strip(), result.stderr.strip()
    except Exception as e:
        print(f"Error running node command: {e}")
        return None, str(e)

def fetch_sitemap():
    # 1. Try local file first
    if os.path.exists('sitemap.xml'):
        print("Reading sitemap from local file: sitemap.xml")
        content = ""
        try:
            with open('sitemap.xml', 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            print("UTF-8 decode failed, trying UTF-16...")
            try:
                with open('sitemap.xml', 'r', encoding='utf-16') as f:
                    content = f.read()
            except Exception as e:
                print(f"Error reading local sitemap with UTF-16: {e}")
                return []
        except Exception as e:
            print(f"Error reading local sitemap: {e}")
            return []
            
        if content:
            return parse_sitemap_content(content)

    # 2. Fetch from URL
    print(f"Fetching sitemap from {SITEMAP_URL}...")
    stdout, stderr = run_node_command(['fetch', SITEMAP_URL])
    
    if not stdout:
        print(f"Failed to fetch sitemap: {stderr}")
        return []
        
    return parse_sitemap_content(stdout)

def parse_sitemap_content(content):
    slugs = []
    try:
        print(f"Content Preview (first 500 chars):\n{content[:500]}")
        
        # Dump all URLs to verify
        all_locs = re.findall(r'<loc>([^<]+)</loc>', content)
        print(f"Total <loc> tags found: {len(all_locs)}")
        
        with open('found_urls.txt', 'w', encoding='utf-8') as f:
            for url in all_locs:
                f.write(url + '\n')
        print("Saved all URLs to found_urls.txt")

        # Try to find schemes based on known slugs to see their pattern
        known_slugs = ['pmmy', 'sui', 'pmjdy']
        for slug in known_slugs:
            matches = [u for u in all_locs if slug in u]
            if matches:
                print(f"Found match for {slug}: {matches}")
        
        # Update regex if needed based on inspection
        # For now, let's look for ANY url that is NOT a static page if we can't find schemes/ prefix
        # But let's verify if schemes/ exists first
        urls = re.findall(r'<loc>https://www.myscheme.gov.in/schemes/([^<]+)</loc>', content)
        slugs = list(set(urls))
        print(f"Found {len(slugs)} schemes with /schemes/ prefix.")
    except Exception as e:
        print(f"Error parsing sitemap: {e}")
    return slugs

def fetch_scheme_details(slug):
    # print(f"Fetching details for: {slug}")
    stdout, stderr = run_node_command(['scheme', slug])
    
    if not stdout:
        print(f"❌ Failed to fetch {slug}: {stderr}")
        return None

    try:
        data = json.loads(stdout)
        if data.get('status') == 'success':
            return data.get('data', {}).get('data') # API returns {statusCode: 200, data: {...}}
        else:
            print(f"❌ Error for {slug}: {data.get('message')}")
            return None
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON for {slug}")
        return None

def main():
    print("🚀 Starting Hybrid Python-Node Crawler...")
    
    if not os.path.exists(RESULTS_DIR):
        os.makedirs(RESULTS_DIR)

    # 1. Get Slugs
    # Try local text file first (Fallback for when sitemap/API is blocked)
    slugs = []
    if os.path.exists('slugs.txt'):
        print("Reading slugs from local file: slugs.txt")
        try:
            with open('slugs.txt', 'r', encoding='utf-8') as f:
                slugs = [line.strip() for line in f if line.strip()]
            print(f"Found {len(slugs)} schemes in slugs.txt.")
        except Exception as e:
             print(f"Error reading slugs.txt: {e}")

    # If no slugs yet, try sitemap
    if not slugs:
        slugs = fetch_sitemap()
        
    if not slugs:
        print("No slugs found. Exiting.")
        return
    
    # 2. Fetch Details
    all_schemes = []
    count = 0
    total = len(slugs)
    
    # Optional: limit for testing
    # slugs = slugs[:5] 

    print(f"\nScanning {len(slugs)} schemes...")
    
    for i, slug in enumerate(slugs):
        print(f"[{i+1}/{total}] Processing: {slug}...", end='\r')
        
        scheme_data = fetch_scheme_details(slug)
        if scheme_data:
            all_schemes.append(scheme_data)
            
            # Save individual file
            with open(f"{RESULTS_DIR}/scheme-{slug}.json", 'w', encoding='utf-8') as f:
                json.dump(scheme_data, f, indent=2, ensure_ascii=False)
            count += 1
        
        # Be nice to the server
        time.sleep(0.5)

    print(f"\n\n✅ value completed! Fetched {count}/{total} schemes.")
    
    # 3. Save Consolidated Data
    output_file = f"{RESULTS_DIR}/all_schemes.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_schemes, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Consolidated data saved to: {output_file}")

if __name__ == "__main__":
    main()
