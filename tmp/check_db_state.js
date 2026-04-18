const { query } = require('./src/config/database');

async function checkDb() {
    try {
        console.log('--- Tables ---');
        const tables = await query("SELECT name FROM sqlite_master WHERE type='table'");
        console.log(tables.rows.map(t => t.name).join(', '));

        console.log('\n--- Recent Crawler Jobs (crawler_jobs) ---');
        const cj = await query("SELECT * FROM crawler_jobs ORDER BY started_at DESC LIMIT 5");
        console.log(JSON.stringify(cj.rows, null, 2));

        console.log('\n--- Recent Crawl Jobs (crawl_jobs) ---');
        const cj2 = await query("SELECT * FROM crawl_jobs ORDER BY started_at DESC LIMIT 5");
        console.log(JSON.stringify(cj2.rows, null, 2));

        console.log('\n--- Crawler Status ---');
        const status = await query("SELECT * FROM crawler_status");
        console.log(JSON.stringify(status.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

checkDb();
