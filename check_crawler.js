const { query } = require('./src/config/database');

async function checkStatus() {
    try {
        console.log('--- Crawler Status ---');
        const status = await query('SELECT * FROM crawler_status');
        console.log(JSON.stringify(status.rows, null, 2));

        console.log('\n--- Recent Crawler Jobs ---');
        const jobs = await query('SELECT * FROM crawler_jobs ORDER BY started_at DESC LIMIT 5');
        console.log(JSON.stringify(jobs.rows, null, 2));

        console.log('\n--- Sources ---');
        const sources = await query('SELECT * FROM sources');
        console.log(JSON.stringify(sources.rows, null, 2));

        console.log('\n--- Data Counts ---');
        const schemesCount = await query('SELECT COUNT(*) as count FROM schemes');
        const tendersCount = await query('SELECT COUNT(*) as count FROM tenders');
        const recruitmentsCount = await query('SELECT COUNT(*) as count FROM recruitments');
        console.log(JSON.stringify({
            schemes: schemesCount.rows[0].count,
            tenders: tendersCount.rows[0].count,
            recruitments: recruitmentsCount.rows[0].count
        }, null, 2));

        console.log('\n--- Latest Schemes ---');
        const latestSchemes = await query('SELECT id, title, slug, created_at FROM schemes ORDER BY created_at DESC LIMIT 3');
        console.log(JSON.stringify(latestSchemes.rows, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkStatus();
