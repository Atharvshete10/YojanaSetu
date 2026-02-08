const SchemesCrawler = require('./src/services/crawlers/schemesCrawler');
const logger = require('./src/services/logger');
require('dotenv').config();

// Mute logger for cleaner output, or let it log
// logger.level = 'info';

async function testIntegration() {
    console.log('Testing SchemesCrawler integration...');

    // Instantiate
    const crawler = new SchemesCrawler();

    try {
        console.log('Starting crawler.crawl()...');
        const result = await crawler.crawl();
        console.log('Crawler finished. Total schemes:', result);
    } catch (error) {
        console.error('Crawler integration test failed:', error);
    } finally {
        process.exit(0);
    }
}

testIntegration();
