/**
 * fetch_sitemap_robust.js
 * Retries fetching sitemap up to 10 times.
 */
const axios = require('axios');
const fs = require('fs');

const URL = 'https://www.myscheme.gov.in/sitemap-0.xml';
const OUTPUT = 'sitemap.xml';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://www.myscheme.gov.in',
    'Referer': 'https://www.myscheme.gov.in/',
    'Accept': 'application/xml, text/xml, */*'
};

async function fetchSitemap() {
    for (let i = 1; i <= 10; i++) {
        console.log(`Checking sitemap (Attempt ${i}/10)...`);
        try {
            const response = await axios.get(URL, { headers, timeout: 20000 });
            if (response.status === 200 && response.data) {
                console.log('✅ Success! Saving to sitemap.xml');
                fs.writeFileSync(OUTPUT, response.data, 'utf8');
                return;
            }
        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
        }

        // Wait 2 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.error('❌ Could not fetch sitemap after 10 attempts.');
}

console.log('🚀 Starting Robust Sitemap Fetcher...');
fetchSitemap();
