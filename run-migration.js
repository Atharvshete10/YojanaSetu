/**
 * Database Migration Runner
 * Applies the enhanced schema migration to the database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('🔄 Running database migration...\n');

        // Read the migration file
        const migrationPath = path.join(__dirname, 'migrations', '002_enhanced_schema.sql');
        console.log(`📂 Reading migration: ${migrationPath}`);

        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Migration file not found: ${migrationPath}`);
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('✓ Migration file loaded\n');
        console.log('⚠️  This will drop the existing schemes table and recreate it!');
        console.log('⚠️  All existing data will be lost!\n');

        // Execute the migration
        console.log('🚀 Executing migration...');
        await client.query(sql);

        console.log('\n✅ Migration completed successfully!\n');

        // Verify the new schema
        const columns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'schemes' 
            ORDER BY ordinal_position
        `);

        console.log('📊 New schema columns:');
        columns.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });

        console.log('\n🎉 Database is ready!');
        console.log('\n📍 Next steps:');
        console.log('1. Run: node load-simple-data.js');
        console.log('2. Visit: http://localhost:3000');
        console.log('3. Click "Schemes" to see your data!\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error('\nFull error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
