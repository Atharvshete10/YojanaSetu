/* eslint-disable no-console */
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

(async () => {
    try {
        const res = await pool.query('SELECT slug, title, status FROM schemes ORDER BY created_at DESC LIMIT 5');
        console.table(res.rows);

        const count = await pool.query('SELECT COUNT(*) FROM schemes');
        console.log(`Total schemes: ${count.rows[0].count}`);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
})();
