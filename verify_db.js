const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log('Tables:', tables.map(t => t.name).join(', '));

        if (tables.some(t => t.name === 'admins')) {
            db.all("SELECT id, email, role FROM admins", (err, admins) => {
                console.log('Admins:', admins);
            });
        }

        if (tables.some(t => t.name === 'schemes')) {
            db.get("SELECT COUNT(*) as count FROM schemes", (err, row) => {
                console.log('Scheme count:', row.count);
            });
        }

        if (tables.some(t => t.name === 'sources')) {
            db.all("SELECT id, name, type, is_active FROM sources", (err, sources) => {
                console.log('Sources:', sources);
            });
        } else {
            console.log('Sources table MISSING');
        }
    });
});
