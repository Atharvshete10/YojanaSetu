const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../../database/data.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite:', err.message);
    } else {
        console.log('✓ Connected to SQLite database:', dbPath);
    }
});

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const method = sql.trim().toUpperCase().startsWith('SELECT') ? 'all' : 'run';
        db[method](sql, params, function (err, rows) {
            if (err) {
                console.error('Database query error:', err.message, 'SQL:', sql);
                return reject(err);
            }
            resolve({
                rows: rows || [],
                rowCount: this.changes || (rows ? rows.length : 0),
                lastID: this.lastID || null
            });
        });
    });
};

module.exports = {
    db,
    query
};
