const SchemesCrawler = require('./src/services/crawlers/schemesCrawler');
const crawler = new SchemesCrawler();

async function run() {
    try {
        console.log("Starting crawler test...");
        // Manually run a single job with limited batch size to debug
         crawler.batchSize = 2; // test a tiny batch
        const count = await crawler.execute();
        console.log("Crawler finished. Fetched:", count);
    } catch(err) {
        console.error("Crawler error:", err);
    }
}
run();
