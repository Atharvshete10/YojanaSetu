const axios = require('axios');
const cheerio = require('cheerio');

async function checkSitemap() {
    try {
        console.log('🤖 Checking robots.txt...');
        const robots = await axios.get('https://www.myscheme.gov.in/robots.txt', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        console.log('📄 Robots Content:\n', robots.data);

        let sitemapUrl = null;
        const match = robots.data.match(/Sitemap: (.*)/i);
        if (match) {
            sitemapUrl = match[1].trim();
        } else {
            // Default guess
            sitemapUrl = 'https://www.myscheme.gov.in/sitemap.xml';
        }

        console.log(`🗺️  Fetching Sitemap: ${sitemapUrl}`);
        const sitemap = await axios.get(sitemapUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });

        const $ = cheerio.load(sitemap.data, { xmlMode: true });
        const urls = $('url loc').map((i, el) => $(el).text()).get();

        console.log(`✅ Found ${urls.length} URLs in sitemap.`);

        // Filter scheme URLs
        // Usually: https://www.myscheme.gov.in/schemes/[slug]
        const schemeUrls = urls.filter(u => u.includes('/schemes/'));
        console.log(`🎯 Found ${schemeUrls.length} likely scheme URLs.`);

        if (schemeUrls.length > 0) {
            console.log('Examples:', schemeUrls.slice(0, 5));
            console.log('💡 TIP: Use these URLs to extract slugs completely bypassing the search API!');
        }

    } catch (err) {
        console.error('❌ Failed:', err.message);
        if (err.response) console.error('   Status:', err.response.status);
    }
}

checkSitemap();
