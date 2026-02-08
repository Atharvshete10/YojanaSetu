import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.sqlite');

export async function initDb() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Create Schemes table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS schemes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            state TEXT NOT NULL,
            region TEXT,
            category TEXT,
            eligibility_criteria TEXT,
            start_date TEXT,
            end_date TEXT,
            documents_required TEXT,
            source_url TEXT UNIQUE,
            source_website TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create Tenders table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS tenders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tender_name TEXT NOT NULL,
            tender_id TEXT UNIQUE,
            reference_number TEXT,
            state TEXT NOT NULL,
            department TEXT,
            tender_type TEXT,
            published_date TEXT,
            opening_date TEXT,
            closing_date TEXT,
            description TEXT,
            documents_required TEXT,
            fee_details TEXT,
            source_url TEXT UNIQUE,
            source_website TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create Recruitments table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS recruitments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_name TEXT NOT NULL,
            organization TEXT,
            state TEXT NOT NULL,
            qualification TEXT,
            vacancy_count INTEGER,
            application_start_date TEXT,
            application_end_date TEXT,
            age_limit TEXT,
            selection_process TEXT,
            application_fee TEXT,
            documents_required TEXT,
            official_notification_link TEXT,
            source_url TEXT UNIQUE,
            source_website TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Add indexes for performance
    try { await db.exec(`CREATE INDEX IF NOT EXISTS idx_schemes_state ON schemes(state)`); } catch (e) { }
    try { await db.exec(`CREATE INDEX IF NOT EXISTS idx_tenders_state ON tenders(state)`); } catch (e) { }
    try { await db.exec(`CREATE INDEX IF NOT EXISTS idx_recruitments_state ON recruitments(state)`); } catch (e) { }
    try { await db.exec(`CREATE INDEX IF NOT EXISTS idx_schemes_last_updated ON schemes(last_updated)`); } catch (e) { }
    try { await db.exec(`CREATE INDEX IF NOT EXISTS idx_tenders_last_updated ON tenders(last_updated)`); } catch (e) { }
    try { await db.exec(`CREATE INDEX IF NOT EXISTS idx_recruitments_last_updated ON recruitments(last_updated)`); } catch (e) { }

    return db;
}

let dbInstance = null;

export async function getDb() {
    if (!dbInstance) {
        dbInstance = await initDb();
    }
    return dbInstance;
}
