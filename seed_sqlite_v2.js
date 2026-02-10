const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function seed() {
    const passwordHash = await bcrypt.hash('admin123', 10);

    db.serialize(() => {
        // Admins Table
        db.run(`CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            username TEXT,
            role TEXT DEFAULT 'moderator',
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert default admin
        db.run(`INSERT OR IGNORE INTO admins (email, password_hash, username, role) 
                VALUES (?, ?, ?, ?)`,
            ['admin@yojanasetu.gov.in', passwordHash, 'System Administrator', 'admin']);

        // Sources Table
        db.run(`CREATE TABLE IF NOT EXISTS sources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            type TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            last_crawled_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert default sources
        const sources = [
            ['MyScheme Portal', 'https://www.myscheme.gov.in/', 'scheme'],
            ['eProcure Portal', 'https://eprocure.gov.in/', 'tender'],
            ['National Career Service', 'https://www.ncs.gov.in/', 'recruitment']
        ];

        const stmt = db.prepare("INSERT OR IGNORE INTO sources (name, url, type) VALUES (?, ?, ?)");
        sources.forEach(s => stmt.run(s));
        stmt.finalize();

        // Audit Logs Table
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id INTEGER,
            changes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES admins(id)
        )`);

        // Crawl Jobs Table
        db.run(`CREATE TABLE IF NOT EXISTS crawl_jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_id INTEGER,
            status TEXT DEFAULT 'pending',
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            records_found INTEGER DEFAULT 0,
            records_saved INTEGER DEFAULT 0,
            error_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (source_id) REFERENCES sources(id)
        )`);

        // Crawl Results Table
        db.run(`CREATE TABLE IF NOT EXISTS crawl_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crawl_job_id INTEGER,
            source_id INTEGER,
            type TEXT NOT NULL,
            raw_data TEXT NOT NULL,
            normalized_data TEXT,
            status TEXT DEFAULT 'pending',
            reviewed_by INTEGER,
            reviewed_at TIMESTAMP,
            rejection_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (crawl_job_id) REFERENCES crawl_jobs(id),
            FOREIGN KEY (source_id) REFERENCES sources(id),
            FOREIGN KEY (reviewed_by) REFERENCES admins(id)
        )`);

        console.log('✓ SQLite database seeded successfully');
    });
}

seed().catch(console.error);
