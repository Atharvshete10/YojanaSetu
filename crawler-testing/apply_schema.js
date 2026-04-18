const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../YojanaSetu/.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function applySchema() {
    let client;
    try {
        console.log('Connecting to database...');
        client = await pool.connect();

        console.log('Dropping old tables...');
        await client.query('DROP TABLE IF EXISTS schemes CASCADE');
        await client.query('DROP TABLE IF EXISTS crawler_jobs CASCADE');
        await client.query('DROP TABLE IF EXISTS crawler_status CASCADE');
        await client.query('DROP TABLE IF EXISTS eligibility_checks CASCADE');

        console.log('Applying Enhanced Schema (002)...');
        const schemaPath = path.resolve(__dirname, '../YojanaSetu/migrations/002_enhanced_schema.sql');
        let sql = fs.readFileSync(schemaPath, 'utf8');

        // Remove comments
        sql = sql.replace(/--.*$/gm, '');

        await client.query(sql);

        console.log('✅ Schema applied successfully.');

    } catch (err) {
        console.error('Error applying schema:', err);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

applySchema();
