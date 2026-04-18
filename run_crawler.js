const TendersCrawler = require('./src/services/crawlers/tendersCrawler');

(async () => {
    const crawler = new TendersCrawler();
    crawler.batchSize = 2; // only get a couple to test
    try {
        console.log("Starting Tenders Crawler Test...");
        const count = await crawler.crawl();
        console.log("Finished. Tenders fetched:", count);
    } catch (e) {
         console.error("Error running crawler:", e);
    }
})();
