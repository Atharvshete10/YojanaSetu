const RecruitmentsCrawler = require('../src/services/crawlers/recruitmentsCrawler');

async function test() {
    const crawler = new RecruitmentsCrawler();
    crawler.batchSize = 2; // only get 2 to be fast
    console.log("Starting test for Maharashtra...");
    await crawler.crawl("Maharashtra");
    console.log("Done Maharashtra!");
    
    console.log("\nStarting test for Uttar Pradesh...");
    await crawler.crawl("Uttar Pradesh");
    console.log("Done UP!");
    process.exit(0);
}

test();
