// Quick test to load one scheme
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        // Check columns
        const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='schemes' ORDER BY ordinal_position");
        console.log('Columns:', cols.rows.map(r => r.column_name).join(', '));

        // Try simple insert
        await pool.query(`
            INSERT INTO schemes (title, slug, external_id, status)
            VALUES ('Test Scheme', 'test-scheme-' || floor(random() * 10000), 'test-123', 'approved')
        `);

        console.log('✓ Insert successful!');

        const count = await pool.query('SELECT COUNT(*) FROM schemes');
        console.log('Total schemes:', count.rows[0].count);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

test();
