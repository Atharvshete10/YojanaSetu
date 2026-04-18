from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import json

# start browser (no need for chromedriver path)
driver = webdriver.Chrome()

# open website
driver.get("https://eprocure.gov.in/eprocure/app")

time.sleep(5)

all_tenders = []

print("Scraping page 1...")

# ✅ TARGET ONLY tender table
rows = driver.find_elements(By.XPATH, "//table[contains(@class,'list_table')]//tr")

for row in rows[1:]:  # skip header

    cols = row.find_elements(By.TAG_NAME, "td")

    # ✅ ensure correct row
    if len(cols) >= 5:

        title = cols[1].text.strip()

        # ❌ skip garbage rows
        if len(title) < 10:
            continue

        all_tenders.append({
            "title": title,
            "referenceNo": cols[2].text.strip(),
            "closingDate": cols[3].text.strip(),
            "openingDate": cols[4].text.strip()
        })

# ✅ SAVE JSON in data folder
with open("../data/tenders.json", "w", encoding="utf-8") as f:
    json.dump(all_tenders, f, indent=2, ensure_ascii=False)

driver.quit()

print("✅ Total tenders:", len(all_tenders))