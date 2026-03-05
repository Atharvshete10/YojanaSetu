const { query } = require('../src/config/database');

async function check() {
    try {
        console.log('--- Database Health Check ---');

        const tables = ['schemes', 'tenders', 'recruitments', 'admins'];

        for (const table of tables) {
            try {
                const res = await query(`SELECT count(*) as count FROM ${table}`);
                console.log(`✅ Table "${table}": ${res.rows[0].count} rows`);
            } catch (err) {
                console.log(`❌ Table "${table}": Error - ${err.message}`);
            }
        }

        console.log('--- Check Complete ---');
        process.exit(0);
    } catch (err) {
        console.error('Core Error:', err);
        process.exit(1);
    }
}

check();
