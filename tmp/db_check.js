const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database.sqlite');
console.log('Database Path:', dbPath);

if (!fs.existsSync(dbPath)) {
    console.error('❌ Database file does not exist at:', dbPath);
    process.exit(1);
}

const stats = fs.statSync(dbPath);
console.log(`Database File Size: ${(stats.size / 1024).toFixed(2)} KB`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to SQLite database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database.');
    checkTables();
});

function checkTables() {
    const tables = ['schemes', 'tenders', 'recruitments', 'admins'];
    let completed = 0;

    tables.forEach(table => {
        db.get(`SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='${table}'`, (err, row) => {
            if (err) {
                console.error(`Error checking for table ${table}:`, err.message);
            } else if (row.count === 0) {
                console.log(`❌ Table "${table}" does NOT exist.`);
            } else {
                db.get(`SELECT count(*) as count FROM ${table}`, (err, row) => {
                    if (err) {
                        console.error(`Error counting rows in ${table}:`, err.message);
                    } else {
                        console.log(`✅ Table "${table}" exists. Row count: ${row.count}`);
                    }
                    checkFinished();
                });
                return;
            }
            checkFinished();
        });
    });

    function checkFinished() {
        completed++;
        if (completed === tables.length) {
            db.close();
            console.log('Diagnostic complete.');
        }
    }
}
