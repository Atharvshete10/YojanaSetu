const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const tables = ['schemes', 'tenders', 'recruitments', 'admins'];

db.serialize(() => {
    tables.forEach(table => {
        db.all(`PRAGMA table_info(${table})`, (err, columns) => {
            if (err) {
                console.error(`Error checking ${table}:`, err);
                return;
            }
            console.log(`Table: ${table}`);
            console.log(columns.map(c => `${c.name} (${c.type})`).join(', '));
            console.log('---');
        });
    });
});
