# Crawler Testing Environment

This directory is for **testing and researching** government website endpoints before integrating them into the main YojanaSetu project.

## 🎯 Purpose

- Explore government websites to find actual data sources
- Test different URLs and API endpoints
- Analyze HTML structure and identify correct CSS selectors
- Save responses for offline analysis
- Finalize working configurations before production

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Basic Tests

```bash
npm test
```

This will test the default government websites and save results to `results/` directory.

### 3. Run Custom Tests

```bash
node custom-test.js
```

Edit `custom-test.js` to add your own URLs and selectors.

## 📁 Directory Structure

```
crawler-testing/
├── package.json          # Dependencies
├── test-crawler.js       # Main test crawler class
├── custom-test.js        # Your custom tests (edit this!)
├── results/              # Saved HTML/JSON responses
│   ├── myscheme-page.html
│   ├── eprocure-page.html
│   └── *.json
└── README.md            # This file
```

## 🔍 How to Use

### Testing a New Website

1. **Open `custom-test.js`**
2. **Add your configuration:**

```javascript
const testSite = new TestCrawler({
    name: 'my-test',
    baseUrl: 'https://example.gov.in',
    testUrl: 'https://example.gov.in/schemes'
});

await testSite.testEndpoint();
```

3. **Run the test:**

```bash
node custom-test.js
```

4. **Check results:**
   - HTML saved to `results/my-test-page.html`
   - Console shows structure analysis

### Testing Specific Selectors

Once you have the HTML, test different CSS selectors:

```javascript
await testSite.testSelector('.scheme-card', 'Scheme cards');
await testSite.testSelector('table tr', 'Table rows');
await testSite.testSelector('div.item h3', 'Item titles');
```

The script will show how many elements match and sample data.

## 📊 Analyzing Results

### For JSON APIs

If the endpoint returns JSON:
- Full response saved to `results/<name>-response.json`
- Console shows data structure
- Use this to understand the API format

### For HTML Pages

If the endpoint returns HTML:
- Full HTML saved to `results/<name>-page.html`
- Console shows:
  - Common containers found
  - Links and their text
  - Tables and headers
  - Forms
- Open the HTML file in a browser to inspect visually

## 🎯 Finding the Right Selectors

### Step-by-Step Process

1. **Save the HTML:**
   ```bash
   node custom-test.js
   ```

2. **Open in Browser:**
   - Open `results/<name>-page.html` in Chrome/Firefox
   - Right-click → Inspect Element
   - Find the data you want to extract

3. **Identify the selector:**
   - Look for unique classes or IDs
   - Note the HTML structure
   - Common patterns:
     - `.scheme-card` - scheme containers
     - `table.schemes tr` - table rows
     - `article.item` - article items

4. **Test the selector:**
   ```javascript
   await testSite.testSelector('YOUR_SELECTOR', 'Description');
   ```

5. **Refine until it works**

## 🌐 Common Government Websites

### Schemes
- **MyScheme**: https://www.myscheme.gov.in
- **State Portals**: https://<state>.gov.in/schemes

### Tenders
- **eProcure**: https://eprocure.gov.in
- **GEM**: https://gem.gov.in
- **State Tender Portals**: Various

### Recruitments
- **NCS**: https://www.ncs.gov.in
- **UPSC**: https://www.upsc.gov.in
- **SSC**: https://ssc.nic.in
- **State PSCs**: Various

## ✅ When You're Ready

Once you've finalized the URLs and selectors:

1. **Document your findings:**
   - Website URL
   - Working selectors
   - Data structure
   - Any special requirements

2. **Update the main project:**
   - Copy working configurations to `YojanaSetu/src/services/crawlers/`
   - Update `schemesCrawler.js`, `tendersCrawler.js`, etc.
   - Update the `sources` table in the database

3. **Test in production:**
   - Run the crawler from admin dashboard
   - Verify data is extracted correctly
   - Check normalization works

## 💡 Tips

- **Start with one website** - Don't try to test everything at once
- **Check robots.txt** - Make sure crawling is allowed
- **Be respectful** - Add delays between requests
- **Save everything** - The HTML files are useful for offline analysis
- **Use browser DevTools** - Best way to find selectors
- **Test incrementally** - Test one selector at a time

## 🐛 Troubleshooting

### "404 Not Found"
- The URL doesn't exist
- Try the base URL first
- Check if the website structure changed

### "Timeout"
- Website is slow or down
- Increase timeout in test-crawler.js
- Try again later

### "No elements found"
- Selector is wrong
- Website uses JavaScript to load content (crawler can't handle this)
- Try a different selector

### "CORS Error"
- Not relevant for Node.js crawlers
- Only affects browser-based scraping

## 📝 Example Workflow

```bash
# 1. Install
npm install

# 2. Run default tests to see how it works
npm test

# 3. Edit custom-test.js with your URL
# 4. Run your custom test
node custom-test.js

# 5. Check results/
ls results/

# 6. Open HTML in browser and inspect
# 7. Test selectors
# 8. Repeat until you find the right ones
# 9. Document and integrate into main project
```

## 🎓 Learning Resources

- **CSS Selectors**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
- **Cheerio Docs**: https://cheerio.js.org/
- **Axios Docs**: https://axios-http.com/

---

**Happy Crawling! 🕷️**
