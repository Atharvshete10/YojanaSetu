/**
 * Clean Database Migration
 * Drops old schema and creates new enhanced schema
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('🔄 Running clean database migration...\n');
        console.log('⚠️  This will drop ALL existing tables and data!');
        console.log('⚠️  Press Ctrl+C now to cancel...\n');

        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('🗑️  Dropping old tables...');

        // Drop all tables in correct order (respecting foreign keys)
        await client.query('DROP TABLE IF EXISTS crawler_jobs CASCADE');
        await client.query('DROP TABLE IF EXISTS crawler_status CASCADE');
        await client.query('DROP TABLE IF EXISTS schemes CASCADE');
        await client.query('DROP TABLE IF EXISTS tenders CASCADE');
        await client.query('DROP TABLE IF EXISTS recruitments CASCADE');
        await client.query('DROP TABLE IF EXISTS admins CASCADE');

        console.log('✓ Old tables dropped\n');

        console.log('🏗️  Creating new enhanced schema...\n');

        // Create enhanced schemes table
        await client.query(`
            CREATE TABLE schemes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                external_id TEXT UNIQUE,
                slug TEXT UNIQUE,
                title TEXT NOT NULL,
                short_title TEXT,
                description TEXT,
                detailed_description JSONB,
                ministry TEXT,
                department TEXT,
                category TEXT,
                sub_category TEXT[],
                level TEXT,
                scheme_type TEXT,
                benefits JSONB,
                eligibility JSONB,
                application_process JSONB,
                documents_required JSONB,
                faqs JSONB,
                tags TEXT[],
                target_beneficiaries TEXT[],
                open_date DATE,
                close_date DATE,
                application_url TEXT,
                contact_info JSONB,
                scheme_references JSONB,
                applicable_states TEXT[],
                lang TEXT DEFAULT 'en',
                translations JSONB,
                status TEXT DEFAULT 'pending',
                approved_by UUID,
                approved_at TIMESTAMP,
                rejection_reason TEXT,
                raw_data JSONB,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log('✓ Created schemes table');

        // Create indexes
        await client.query('CREATE INDEX idx_schemes_external_id ON schemes(external_id)');
        await client.query('CREATE INDEX idx_schemes_slug ON schemes(slug)');
        await client.query('CREATE INDEX idx_schemes_status ON schemes(status)');
        await client.query('CREATE INDEX idx_schemes_category ON schemes(category)');
        await client.query('CREATE INDEX idx_schemes_ministry ON schemes(ministry)');
        await client.query('CREATE INDEX idx_schemes_level ON schemes(level)');
        await client.query('CREATE INDEX idx_schemes_tags ON schemes USING GIN(tags)');
        await client.query('CREATE INDEX idx_schemes_states ON schemes USING GIN(applicable_states)');

        console.log('✓ Created indexes');

        // Create crawler_status table
        await client.query(`
            CREATE TABLE crawler_status (
                id SERIAL PRIMARY KEY,
                is_running BOOLEAN DEFAULT FALSE,
                current_job_id UUID,
                last_run_at TIMESTAMP,
                last_success_at TIMESTAMP,
                last_error TEXT,
                total_runs INTEGER DEFAULT 0,
                total_success INTEGER DEFAULT 0,
                total_failures INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query("INSERT INTO crawler_status (id) VALUES (1)");
        console.log('✓ Created crawler_status table');

        // Create crawler_jobs table
        await client.query(`
            CREATE TABLE crawler_jobs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                job_type TEXT DEFAULT 'schemes',
                status TEXT DEFAULT 'running',
                started_at TIMESTAMP DEFAULT NOW(),
                completed_at TIMESTAMP,
                total_fetched INTEGER DEFAULT 0,
                success_count INTEGER DEFAULT 0,
                failed_count INTEGER DEFAULT 0,
                duplicate_count INTEGER DEFAULT 0,
                error_count INTEGER DEFAULT 0,
                error_message TEXT,
                batch_size INTEGER DEFAULT 50,
                current_batch INTEGER DEFAULT 0,
                config JSONB,
                triggered_by TEXT,
                last_updated TIMESTAMP DEFAULT NOW(),
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        await client.query('CREATE INDEX idx_crawler_jobs_status ON crawler_jobs(status)');
        await client.query('CREATE INDEX idx_crawler_jobs_started ON crawler_jobs(started_at DESC)');
        console.log('✓ Created crawler_jobs table');

        // Create admins table
        await client.query(`
            CREATE TABLE admins (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'moderator',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('✓ Created admins table');

        console.log('\n✅ Migration completed successfully!\n');

        // Verify
        const tables = await client.query(`
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);

        console.log('📊 Tables created:');
        tables.rows.forEach(t => console.log(`  - ${t.tablename}`));

        console.log('\n🎉 Database is ready!');
        console.log('\n📍 Next steps:');
        console.log('1. Run: node load-simple-data.js');
        console.log('2. Visit: http://localhost:3000');
        console.log('3. Click "Schemes" to see your data!\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
