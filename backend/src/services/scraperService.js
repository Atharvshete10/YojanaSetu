const cron = require('node-cron');
const scrapeSchemes = require('../scraper/schemesScraper');
const scrapeTenders = require('../scraper/tendersScraper');
const scrapeJobs = require('../scraper/jobsScraper');

// Run every 6 hours
cron.schedule('0 */6 * * *', async () => {
    console.log('--- Starting Scheduled Scraping Task ---');
    await scrapeSchemes();
    await scrapeTenders();
    await scrapeJobs();
    console.log('--- Scheduled Scraping Task Completed ---');
});

// Function to trigger all scrapers immediately
async function runAllScrapers() {
    console.log('--- Manual Scraping Triggered ---');
    await scrapeSchemes();
    await scrapeTenders();
    await scrapeJobs();
    console.log('--- Manual Scraping Completed ---');
}

module.exports = { runAllScrapers };
