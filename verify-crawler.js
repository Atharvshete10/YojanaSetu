const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function verifySchemes() {
    const client = await pool.connect();
    try {
        console.log('📊 Verifying Database Content...\n');

        // 1. Total Count
        const countRes = await client.query('SELECT count(*) FROM schemes');
        console.log(`✅ Total Schemes in DB: ${countRes.rows[0].count}`);

        // 2. List All Schemes
        console.log('\n📜 List of Schemes:');
        console.log('----------------------------------------');
        const schemesRes = await client.query(`
            SELECT title, slug, scheme_type, created_at 
            FROM schemes 
            ORDER BY created_at DESC
        `);

        schemesRes.rows.forEach((s, i) => {
            console.log(`${i + 1}. [${s.slug}] ${s.title} (${new Date(s.created_at).toLocaleTimeString()})`);
        });

        // 3. Crawler Job Stats
        console.log('\n🕷️  Latest Crawler Job Stats:');
        const jobRes = await client.query(`
            SELECT status, total_fetched, success_count, failed_count, duplicate_count, created_at
            FROM crawler_jobs 
            ORDER BY created_at DESC LIMIT 1
        `);
        if (jobRes.rows.length > 0) {
            console.table(jobRes.rows[0]);
        } else {
            console.log('No crawler jobs found.');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

verifySchemes();
