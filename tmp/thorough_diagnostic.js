const { query } = require('./src/config/database');

async function diagnostic() {
    try {
        console.log('=== DB DIAGNOSTIC ===');

        // 1. Check Tables
        const tables = await query("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables:', tables.rows.map(t => t.name).join(', '));

        // 2. Crawler Status
        const status = await query("SELECT * FROM crawler_status WHERE id = 1");
        console.log('\nCrawler Status:', JSON.stringify(status.rows, null, 2));

        // 3. Crawler Jobs
        const jobsCount = await query("SELECT count(*) as count FROM crawler_jobs");
        console.log('\nTotal Crawler Jobs:', jobsCount.rows[0].count);

        const recentJobs = await query("SELECT id, job_type, status, started_at, total_fetched FROM crawler_jobs ORDER BY id DESC LIMIT 5");
        console.log('Recent Jobs:', JSON.stringify(recentJobs.rows, null, 2));

        // 4. Audit Logs
        const recentAudit = await query("SELECT id, action, entity_type, entity_id, created_at FROM audit_logs ORDER BY id DESC LIMIT 5");
        console.log('\nRecent Audit Logs:', JSON.stringify(recentAudit.rows, null, 2));

        // 5. Test Parameter Count Issue
        console.log('\nTesting Parameter Mapping...');
        try {
            // This mimics updateGlobalStatus pattern
            const testSql = "SELECT $1 as a, $2 as b, $3 as c, $3 as d";
            const testParams = ['val1', 'val2', 'val3'];
            const res = await query(testSql, testParams);
            console.log('Test Select Result:', JSON.stringify(res.rows, null, 2));
        } catch (e) {
            console.log('Test Select Failed (as expected?):', e.message);
        }

    } catch (err) {
        console.error('\nDIAGNOSTIC FAILED:', err);
    }
}

diagnostic();
