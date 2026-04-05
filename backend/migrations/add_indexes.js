/**
 * Add SQLite performance indexes for YojanaSetu
 * Run: node migrations/add_indexes.js
 */

const path = require('path');
const Database = require('better-sqlite3');

const dbPath = process.env.SQLITE_PATH || path.resolve(__dirname, '../database.sqlite');
console.log(`Adding indexes to: ${dbPath}`);

const db = new Database(dbPath);

const indexes = [
    // Schemes indexes
    { name: 'idx_schemes_status', sql: `CREATE INDEX IF NOT EXISTS idx_schemes_status     ON schemes(status)` },
    { name: 'idx_schemes_state', sql: `CREATE INDEX IF NOT EXISTS idx_schemes_state      ON schemes(state)` },
    { name: 'idx_schemes_category', sql: `CREATE INDEX IF NOT EXISTS idx_schemes_category   ON schemes(category)` },
    { name: 'idx_schemes_ministry', sql: `CREATE INDEX IF NOT EXISTS idx_schemes_ministry   ON schemes(ministry)` },
    { name: 'idx_schemes_created_at', sql: `CREATE INDEX IF NOT EXISTS idx_schemes_created_at ON schemes(created_at)` },
    { name: 'idx_schemes_level', sql: `CREATE INDEX IF NOT EXISTS idx_schemes_level      ON schemes(level)` },

    // Tenders indexes
    { name: 'idx_tenders_status', sql: `CREATE INDEX IF NOT EXISTS idx_tenders_status     ON tenders(status)` },
    { name: 'idx_tenders_state', sql: `CREATE INDEX IF NOT EXISTS idx_tenders_state      ON tenders(state)` },
    { name: 'idx_tenders_department', sql: `CREATE INDEX IF NOT EXISTS idx_tenders_department ON tenders(department)` },
    { name: 'idx_tenders_closing', sql: `CREATE INDEX IF NOT EXISTS idx_tenders_closing    ON tenders(closing_date)` },
    { name: 'idx_tenders_created_at', sql: `CREATE INDEX IF NOT EXISTS idx_tenders_created_at ON tenders(created_at)` },
    { name: 'idx_tenders_tender_id', sql: `CREATE INDEX IF NOT EXISTS idx_tenders_tender_id  ON tenders(tender_id)` },

    // Recruitments indexes
    { name: 'idx_rec_status', sql: `CREATE INDEX IF NOT EXISTS idx_rec_status     ON recruitments(status)` },
    { name: 'idx_rec_state', sql: `CREATE INDEX IF NOT EXISTS idx_rec_state      ON recruitments(state)` },
    { name: 'idx_rec_org', sql: `CREATE INDEX IF NOT EXISTS idx_rec_org        ON recruitments(organization)` },
    { name: 'idx_rec_end_date', sql: `CREATE INDEX IF NOT EXISTS idx_rec_end_date   ON recruitments(application_end_date)` },
    { name: 'idx_rec_created_at', sql: `CREATE INDEX IF NOT EXISTS idx_rec_created_at ON recruitments(created_at)` },
];

let success = 0;
let failed = 0;

for (const idx of indexes) {
    try {
        db.exec(idx.sql);
        console.log(`✓  Created index: ${idx.name}`);
        success++;
    } catch (err) {
        console.error(`✗  Failed index ${idx.name}: ${err.message}`);
        failed++;
    }
}

db.close();
console.log(`\nDone. ${success} indexes created, ${failed} failed.`);
