const RecruitmentsCrawler = require('./src/services/crawlers/recruitmentsCrawler');
const RecruitmentModel = require('./src/models/Recruitment');
const { query } = require('./src/config/database');

(async () => {
    try {
        const crawler = new RecruitmentsCrawler();
        crawler.batchSize = 2; // Scrape 2 UP jobs
        
        console.log("Starting UP rec crawl test...");
        let count = await crawler.crawl('Uttar Pradesh');
        console.log("Finished crawl, fetched: ", count);
        
        // Auto-approve them!
        const rows = await query(`SELECT * FROM crawl_results WHERE type='recruitment' AND status='pending' LIMIT 2`);
        for (let row of rows.rows) {
            let data = JSON.parse(row.normalized_data);
            await RecruitmentModel.create(data, 1);
            await query(`UPDATE crawl_results SET status='approved' WHERE id=$1`, [row.id]);
        }
        console.log("Auto-approved the 2 UP jobs! You can view them on the Dashboard.");
        
    } catch(e) {
        console.error("Crawl error:", e);
    } finally {
        process.exit(0);
    }
})();
