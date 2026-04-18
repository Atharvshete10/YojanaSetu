const SchemesCrawler = require('./src/services/crawlers/schemesCrawler');
const crawler = new SchemesCrawler();
// Mock globals
process.env.MYSCHEME_API_BASE = 'https://api.myscheme.gov.in/schemes/v6/public/schemes';

async function run() {
    console.log("Fetching first page of search results (10 items)...");
    const searchUrl = 'https://api.myscheme.gov.in/search/v6/schemes?lang=en&q=%5B%5D&keyword=&sort=&from=0&size=10';
    const searchRes = await crawler.fetchWithRetry(searchUrl, {
        headers: {
            'x-api-key': crawler.apiKey || 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc',
            'accept': 'application/json, text/plain, */*',
            'origin': 'https://www.myscheme.gov.in'
        }
    });

    const items = searchRes.data?.data?.hits?.items || [];
    console.log(`Found ${items.length} items`);

    let success = 0;
    let failed = 0;

    for (let item of items) {
        const slug = item.fields?.slug;
        console.log(`Testing slug: ${slug}`);
        crawler.saveScheme = async(s) => 'success';
        const res = await crawler.fetchAndSaveScheme(slug);
        if (res === true) success++;
        else failed++;
    }
    
    require('fs').writeFileSync('test_crawler3.json', JSON.stringify({success, failed}));
}
run();
