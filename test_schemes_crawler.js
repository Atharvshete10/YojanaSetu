/* eslint-disable no-console */
require('dotenv').config();
const SchemesCrawler = require('./src/services/crawlers/schemesCrawler');
const logger = require('./src/services/logger');

(async () => {
    console.log('🚀 Starting Test for SchemesCrawler...');
    const crawler = new SchemesCrawler();

    try {
        const count = await crawler.crawl();
        console.log(`✅ Crawler finished. Fetched ${count} schemes.`);
    } catch (error) {
        console.error('❌ Crawler failed:', error);
    } finally {
        if (crawler.pool) {
            await crawler.pool.end();
        }
        process.exit(0);
    }
})();
