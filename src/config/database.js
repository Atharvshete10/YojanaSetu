const sqlite3 = require('sqlite3').verbose();
const config = require('./env');
const path = require('path');

// Create SQLite connection
const db = new sqlite3.Database(config.database.dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('✓ Connected to SQLite database');
    }
});

// Query helper function (mimics PG interface)
const query = (text, params = []) => {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        // Convert $1, $2, etc. to ?, ?, etc. for SQLite
        let sql = text;
        if (Array.isArray(params)) {
            sql = text.replace(/\$\d+/g, '?');
        }

        const method = sql.trim().toUpperCase().startsWith('SELECT') ? 'all' : 'run';

        db[method](sql, params, function (err, rows) {
            if (err) {
                console.error('Database query error:', err);
                return reject(err);
            }

            const duration = Date.now() - start;
            // console.log('Executed query', { sql, duration, rows: Array.isArray(rows) ? rows.length : this.changes });

            resolve({
                rows: Array.isArray(rows) ? rows : [],
                rowCount: Array.isArray(rows) ? rows.length : this.changes,
                lastID: this.lastID
            });
        });
    });
};

// Transaction helper (Simplified for SQLite)
const transaction = async (callback) => {
    return new Promise((resolve, reject) => {
        db.serialize(async () => {
            try {
                db.run('BEGIN TRANSACTION');
                const result = await callback({
                    query: (text, params) => query(text, params)
                });
                db.run('COMMIT', (err) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            } catch (error) {
                db.run('ROLLBACK', () => reject(error));
            }
        });
    });
};

module.exports = {
    pool: db, // Export db as pool for limited compatibility
    query,
    transaction
};
