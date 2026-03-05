const { query } = require('../src/config/database');

async function verify() {
    try {
        console.log('--- Testing Job Creation ---');
        const res = await query(
            'INSERT INTO crawler_jobs(job_type, status, batch_size) VALUES($1, $2, $3)',
            ['verify_test', 'running', 10]
        );
        console.log('Insert Result (lastID):', res.lastID);

        if (!res.lastID) {
            throw new Error('No lastID returned!');
        }

        console.log('\n--- Testing Status Update (with repeated $N) ---');
        // This query repeats $3
        await query(`
            UPDATE crawler_status
            SET
                is_running = $1,
                current_job_id = $2,
                last_error = $3,
                last_success_at = CASE WHEN $3 IS NULL THEN CURRENT_TIMESTAMP ELSE last_success_at END
            WHERE id = 1
        `, [1, res.lastID, null]);

        console.log('Status update successful!');

        console.log('\n--- Cleaning up ---');
        await query('DELETE FROM crawler_jobs WHERE id = $1', [res.lastID]);
        console.log('Cleanup complete. Verification SUCCESS.');

    } catch (err) {
        console.error('\nVerification FAILED:', err);
        process.exit(1);
    }
}

verify();
