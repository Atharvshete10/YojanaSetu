import subprocess
import os

DISCOVERY_SCRIPT = 'discover_slugs.js'
CRAWLER_SCRIPT = 'crawler.py'

def run_step(description, command):
    print(f"\n🚀 {description}...")
    try:
        # Check if node script exists
        if command[0] == 'node' and not os.path.exists(command[1]):
            print(f"❌ Automation script {command[1]} not found!")
            return False
            
        subprocess.run(command, check=True)
        print("✅ Done.")
        return True
    except subprocess.CalledProcessError:
        print(f"❌ {description} failed.")
        return False
    except FileNotFoundError:
        print(f"❌ Command not found: {command[0]}")
        return False

def main():
    print("🤖 Starting Automated Scheme Crawler Pipeline")
    print("===========================================")

    # Step 1: Discover Slugs (using Puppeteer)
    print("Step 1: Discovering Schemes...")
    if not run_step("Running Puppeteer Discovery", ['node', DISCOVERY_SCRIPT]):
        print("⚠️ Discovery failed. Proceeding with existing slugs.txt if available.")
    
    # Step 2: Extract Data
    print("\nStep 2: extracting Data...")
    if run_step("Running Python Crawler", ['python', CRAWLER_SCRIPT]):
        # Step 3: Save to DB
        print("\nStep 3: Saving to Database...")
        run_step("Running DB Saver", ['node', 'save_to_db.js'])
    else:
        print("⚠️ Crawler failed. Skipping DB save.")

if __name__ == "__main__":
    main()
