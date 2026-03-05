const { query } = require('./src/config/database');

async function test() {
    try {
        console.log('--- Test Insertion ---');
        const res = await query('INSERT INTO crawler_jobs (job_type, status, batch_size) VALUES ($1, $2, $3)', ['test', 'running', 10]);
        console.log('Insert Result:', JSON.stringify(res, null, 2));

        if (res.lastID) {
            console.log('\n--- Verifying Insertion ---');
            const check = await query('SELECT * FROM crawler_jobs WHERE id = $1', [res.lastID]);
            console.log('Check Result:', JSON.stringify(check.rows, null, 2));
        } else {
            console.log('\n❌ No lastID returned');
        }
    } catch (e) {
        console.error('\n❌ Test Failed:', e);
    }
}

test();
