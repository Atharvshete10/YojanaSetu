const scrapeMyScheme = require('../../scraper/schemesScraper');
const scrapeTenders = require('../../scraper/tendersScraper');
const scrapeJobs = require('../../scraper/jobsScraper');
const logger = require('../../services/logger');

// Store crawler status in memory for simplicity
// In a real app, this should be in the database
let crawlerStatus = {
    myscheme: { status: 'idle', lastRun: null, error: null },
    tenders: { status: 'idle', lastRun: null, error: null },
    jobs: { status: 'idle', lastRun: null, error: null }
};

exports.getStatus = (req, res) => {
    res.json({
        success: true,
        status: crawlerStatus
    });
};

exports.triggerCrawler = async (req, res) => {
    const { source } = req.body;

    if (!['myscheme', 'tenders', 'jobs'].includes(source)) {
        return res.status(400).json({ success: false, message: 'Invalid source' });
    }

    if (crawlerStatus[source].status === 'running') {
        return res.status(400).json({ success: false, message: 'Crawler is already running' });
    }

    // Run crawler asynchronously
    crawlerStatus[source].status = 'running';
    
    // We don't await here to return response quickly
    (async () => {
        try {
            logger.info(`Manually triggering ${source} crawler`);
            if (source === 'myscheme') await scrapeMyScheme();
            else if (source === 'tenders') await scrapeTenders();
            else if (source === 'jobs') await scrapeJobs();
            
            crawlerStatus[source].status = 'idle';
            crawlerStatus[source].lastRun = new Date().toISOString();
            crawlerStatus[source].error = null;
        } catch (error) {
            logger.error(`${source} crawler failed: ${error.message}`);
            crawlerStatus[source].status = 'error';
            crawlerStatus[source].error = error.message;
        }
    })();

    res.json({
        success: true,
        message: `${source} crawler triggered`
    });
};
