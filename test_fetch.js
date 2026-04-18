const SchemesCrawler = require('./src/services/crawlers/schemesCrawler');
const crawler = new SchemesCrawler();
// Mock globals
process.env.MYSCHEME_API_BASE = 'https://api.myscheme.gov.in/schemes/v6/public/schemes';

async function run() {
    crawler.saveScheme = async (s) => 'success'; // Mock save
    const slugs = ['sukanya-samriddhi-yojana', 'pmkvy', 'pmsby'];
    const results = [];
    for (let slug of slugs) {
        const res = await crawler.fetchAndSaveScheme(slug);
        results.push({slug, res});
    }
    require('fs').writeFileSync('test_fetch_out.json', JSON.stringify(results));
}
run();
