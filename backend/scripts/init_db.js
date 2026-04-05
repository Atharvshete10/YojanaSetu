const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '../../database');
const dbPath = path.join(dbDir, 'data.db');

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

db.serialize(() => {
    // Create schemes table
    db.run(`CREATE TABLE IF NOT EXISTS schemes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        ministry TEXT,
        state TEXT,
        eligibility TEXT,
        deadline TEXT,
        link TEXT UNIQUE NOT NULL
    )`, (err) => {
        if (err) console.error('Error creating schemes table:', err.message);
        else console.log('✓ Schemes table ready');
    });

    // Create tenders table
    db.run(`CREATE TABLE IF NOT EXISTS tenders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        department TEXT,
        state TEXT,
        closing_date TEXT,
        link TEXT UNIQUE NOT NULL
    )`, (err) => {
        if (err) console.error('Error creating tenders table:', err.message);
        else console.log('✓ Tenders table ready');
    });

    // Create recruitments table
    db.run(`CREATE TABLE IF NOT EXISTS recruitments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_name TEXT NOT NULL,
        department TEXT,
        state TEXT,
        last_date TEXT,
        link TEXT UNIQUE NOT NULL
    )`, (err) => {
        if (err) console.error('Error creating recruitments table:', err.message);
        else console.log('✓ Recruitments table ready');
    });
});

db.close((err) => {
    if (err) console.error(err.message);
    console.log('Database connection closed.');
});
