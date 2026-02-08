const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('🚀 Starting Automated Discovery with Puppeteer...');

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Go to search page
    console.log('Navigating to search page...');
    await page.goto('https://www.myscheme.gov.in/search', { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for schemes to load
    try {
        await page.waitForSelector('a[href^="/schemes/"]', { timeout: 10000 });
    } catch (e) {
        console.log('⚠️  Could not find scheme links initially. Page might be structured differently.');
    }

    // Scroll to bottom repeatedly to load all schemes (infinite scroll)
    console.log('Scrolling to load all schemes...');
    let previousHeight = 0;
    while (true) {
        // Scroll to bottom
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');

        // Wait for potential load
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if height has changed
        const currentHeight = await page.evaluate('document.body.scrollHeight');
        if (currentHeight === previousHeight) {
            break; // Stop scrolling if height hasn't changed
        }
        previousHeight = currentHeight;
        console.log(`  Scrolled to height: ${currentHeight}`);
    }

    // Extract all scheme links
    console.log('Extracting scheme slugs...');
    const hrefs = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href^="/schemes/"]'));
        return anchors.map(a => a.getAttribute('href'));
    });

    // Process slugs
    const slugs = new Set();
    hrefs.forEach(href => {
        // href format is usually /schemes/[slug] or /schemes/[slug]/...
        const parts = href.split('/');
        if (parts.length >= 3) {
            const slug = parts[2];
            if (slug && !slug.includes('#') && !slug.includes('?')) {
                slugs.add(slug);
            }
        }
    });

    const slugList = Array.from(slugs);
    console.log(`✅ Found ${slugList.length} unique schemes.`);

    if (slugList.length > 0) {
        fs.writeFileSync('slugs.txt', slugList.join('\n'), 'utf8');
        console.log('💾 Saved to slugs.txt');
    } else {
        console.error('❌ No schemes found!');
    }

    await browser.close();
})();
