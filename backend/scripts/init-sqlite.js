const { query } = require('../src/config/database');

async function init() {
    try {
        console.log('Initializing SQLite database schema...');

        // Schemes Table
        await query(`
            CREATE TABLE IF NOT EXISTS schemes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                external_id TEXT UNIQUE,
                slug TEXT UNIQUE,
                title TEXT,
                scheme_name TEXT,
                short_title TEXT,
                description TEXT,
                detailed_description TEXT,
                ministry TEXT,
                department TEXT,
                category TEXT,
                sub_category TEXT,
                target_beneficiaries TEXT,
                level TEXT,
                scheme_type TEXT,
                benefits TEXT,
                eligibility TEXT,
                application_process TEXT,
                mode_of_application TEXT,
                documents_required TEXT,
                faqs TEXT,
                tags TEXT,
                open_date TEXT,
                close_date TEXT,
                launch_year TEXT,
                last_updated TEXT,
                application_url TEXT,
                application_link TEXT,
                official_website TEXT,
                contact_info TEXT,
                "references" TEXT,
                applicable_states TEXT,
                state TEXT,
                lang TEXT DEFAULT 'en',
                translations TEXT,
                raw_data TEXT,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tenders Table
        await query(`
            CREATE TABLE IF NOT EXISTS tenders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tender_name TEXT,
                tender_title TEXT,
                tender_id TEXT UNIQUE,
                reference_number TEXT,
                state TEXT,
                department TEXT,
                organization TEXT,
                tender_type TEXT,
                tender_category TEXT,
                location TEXT,
                published_date TEXT,
                bid_start_date TEXT,
                opening_date TEXT,
                closing_date TEXT,
                description TEXT,
                amount TEXT,
                tender_value TEXT,
                emd_amount TEXT,
                document_fee TEXT,
                contract_period TEXT,
                eligibility_criteria TEXT,
                documents_required TEXT,
                contact_details TEXT,
                url TEXT,
                link TEXT,
                source_website TEXT,
                tender_status TEXT DEFAULT 'active',
                status TEXT DEFAULT 'approved',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Recruitments Table
        await query(`
            CREATE TABLE IF NOT EXISTS recruitments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_name TEXT,
                job_title TEXT,
                organization TEXT,
                department TEXT,
                state TEXT,
                job_location TEXT,
                qualification TEXT,
                vacancies INTEGER,
                number_of_posts INTEGER,
                application_start_date TEXT,
                application_end_date TEXT,
                last_date TEXT,
                age_limit TEXT,
                salary TEXT,
                selection_process TEXT,
                application_fee TEXT,
                documents_required TEXT,
                url TEXT,
                apply_link TEXT,
                official_notification TEXT,
                source_website TEXT,
                status TEXT DEFAULT 'approved',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Admins Table
        await query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                username TEXT,
                role TEXT DEFAULT 'moderator',
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Sources Table
        await query(`
            CREATE TABLE IF NOT EXISTS sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                type TEXT NOT NULL, -- schemes, tenders, recruitments
                last_crawled_at DATETIME,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crawler Status Table
        await query(`
            CREATE TABLE IF NOT EXISTS crawler_status (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                is_running BOOLEAN DEFAULT 0,
                current_job_id INTEGER,
                last_run_at DATETIME,
                last_success_at DATETIME,
                last_error TEXT,
                total_runs INTEGER DEFAULT 0,
                total_success INTEGER DEFAULT 0,
                total_failures INTEGER DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crawler Jobs Table
        await query(`
            CREATE TABLE IF NOT EXISTS crawler_jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id INTEGER,
                job_type TEXT, -- schemes, tenders, recruitments
                status TEXT DEFAULT 'pending', -- pending, running, completed, failed, paused, stopped
                batch_size INTEGER,
                current_batch INTEGER DEFAULT 0,
                estimated_total INTEGER DEFAULT 0,
                total_fetched INTEGER DEFAULT 0,
                success_count INTEGER DEFAULT 0,
                failed_count INTEGER DEFAULT 0,
                duplicate_count INTEGER DEFAULT 0,
                error_count INTEGER DEFAULT 0,
                error_message TEXT,
                progress_percentage INTEGER DEFAULT 0,
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_id) REFERENCES sources(id)
            )
        `);

        // Crawl Results Table
        await query(`
            CREATE TABLE IF NOT EXISTS crawl_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                crawl_job_id INTEGER,
                source_id INTEGER,
                type TEXT,
                raw_data TEXT,
                normalized_data TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (crawl_job_id) REFERENCES crawler_jobs(id),
                FOREIGN KEY (source_id) REFERENCES sources(id)
            )
        `);

        // Audit Logs Table
        await query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id INTEGER,
                action TEXT NOT NULL,
                entity_type TEXT,
                entity_id INTEGER,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES admins(id)
            )
        `);

        // Insert initial crawler status if not exists
        await query(`INSERT OR IGNORE INTO crawler_status (id) VALUES (1)`);

        console.log('✅ SQLite schema initialized successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to initialize SQLite schema:', err);
        process.exit(1);
    }
}

init();
