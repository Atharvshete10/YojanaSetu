const cron = require('node-cron');
const scrapeSchemes = require('../scraper/schemesScraper');
const scrapeTenders = require('../scraper/tendersScraper');
const scrapeJobs = require('../scraper/jobsScraper');

const initScheduler = () => {
    console.log('✓ Scheduler initialized');

    // Run scrapers every 6 hours (0, 6, 12, 18)
    cron.schedule('0 */6 * * *', async () => {
        console.log('--- Running Scheduled Scrapers ---');
        try {
            await scrapeSchemes();
            await scrapeTenders();
            await scrapeJobs();
            console.log('--- Scheduled Scrapers Completed ---');
        } catch (error) {
            console.error('Error in scheduled scrapers:', error);
        }
    });

    // Optionally run once on startup
    console.log('Running initial scrapers on startup...');
    scrapeSchemes();
    scrapeTenders();
    scrapeJobs();
};

module.exports = initScheduler;
