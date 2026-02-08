// Script to run database migration
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function migrate() {
    try {
        console.log('Starting database migration...');

        // Read migration file
        const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Execute migration
        await pool.query(sql);

        console.log('✓ Migration completed successfully!');
        console.log('✓ All tables created');
        console.log('✓ Indexes created');
        console.log('✓ Default admin account created (email: admin@yojanasetu.gov.in, password: admin123)');
        console.log('\n⚠️  IMPORTANT: Change the default admin password immediately!');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
