const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const tables = ['schemes', 'tenders', 'recruitments'];

db.serialize(() => {
    tables.forEach(table => {
        db.run(`ALTER TABLE ${table} ADD COLUMN status TEXT DEFAULT 'approved'`, (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`Column 'status' already exists in ${table}`);
                } else {
                    console.error(`Error updating ${table}:`, err);
                }
            } else {
                console.log(`✓ Added 'status' column to ${table}`);
            }
        });

        // Also add missing 'ministry' and other columns if they are expected by controllers
        // The schemes table was missing 'ministry', 'department', 'level', 'tags'
        if (table === 'schemes') {
            ['ministry', 'department', 'level', 'tags', 'slug', 'external_id'].forEach(col => {
                db.run(`ALTER TABLE schemes ADD COLUMN ${col} TEXT`, (err) => {
                    if (!err) console.log(`✓ Added '${col}' column to schemes`);
                });
            });
        }
    });
});
