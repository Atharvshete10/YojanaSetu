/**
 * Sample Data Loader for YojanaSetu
 * Loads test schemes from crawler-testing results into the database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Helper function to create slug from title
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Helper function to extract data from scheme object
function extractSchemeData(scheme) {
    // The JSON has a flat structure with direct properties
    return {
        external_id: scheme.id || `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        slug: scheme.slug || createSlug(scheme.name || 'untitled-scheme'),
        title: scheme.name || 'Untitled Scheme',
        short_title: scheme.shortTitle || scheme.name || 'Untitled',
        description: scheme.description || 'No description available',
        ministry: scheme.ministry || 'Unknown Ministry',
        department: scheme.department || null,
        category: scheme.category || 'General',
        level: scheme.level || 'Central',
        tags: scheme.tags || [],
        target_beneficiaries: scheme.targetBeneficiaries || [],
        applicable_states: ['All India'], // Default since not in sample data
        open_date: scheme.openDate && scheme.openDate !== 'Open' ? scheme.openDate : null,
        close_date: scheme.closeDate && scheme.closeDate !== 'Open' ? scheme.closeDate : null,

        // JSONB fields
        benefits: {
            description: scheme.benefits || null,
            list: []
        },
        eligibility: {
            age: null,
            income: null,
            category: null,
            gender: null,
            description: scheme.eligibility || null
        },
        application_process: {
            steps: [],
            online_url: null,
            offline_process: null
        },
        documents_required: [],
        faqs: [],
        contact_info: {
            phone: null,
            email: null,
            website: null,
            address: null
        },

        status: 'approved',
        last_updated: new Date()
    };
}

async function loadSampleData() {
    const client = await pool.connect();

    try {
        console.log('🚀 Starting sample data loader...\n');

        // Read the sample data file
        const dataPath = path.join(__dirname, '..', 'crawler-testing', 'results', '10-schemes-summary.json');
        console.log(`📂 Reading data from: ${dataPath}`);

        if (!fs.existsSync(dataPath)) {
            throw new Error(`Sample data file not found at: ${dataPath}`);
        }

        const rawData = fs.readFileSync(dataPath, 'utf8');
        const schemes = JSON.parse(rawData);

        console.log(`✓ Found ${schemes.length} schemes in sample data\n`);

        let inserted = 0;
        let updated = 0;
        let skipped = 0;

        for (const scheme of schemes) {
            try {
                const data = extractSchemeData(scheme);

                // Check if scheme already exists
                const existingResult = await client.query(
                    'SELECT id FROM schemes WHERE slug = $1',
                    [data.slug]
                );

                if (existingResult.rows.length > 0) {
                    // Update existing scheme
                    await client.query(`
                        UPDATE schemes SET
                            title = $1,
                            description = $2,
                            ministry = $3,
                            category = $4,
                            level = $5,
                            tags = $6::text[],
                            applicable_states = $7::text[],
                            benefits = $8::jsonb,
                            eligibility = $9::jsonb,
                            application_process = $10::jsonb,
                            documents_required = $11::jsonb,
                            faqs = $12::jsonb,
                            contact_info = $13::jsonb,
                            last_updated = NOW()
                        WHERE slug = $14
                    `, [
                        data.title, data.description, data.ministry, data.category,
                        data.level, data.tags, data.applicable_states,
                        data.benefits,
                        data.eligibility,
                        data.application_process,
                        data.documents_required,
                        data.faqs,
                        data.contact_info,
                        data.slug
                    ]);

                    updated++;
                    console.log(`✓ Updated: ${data.title}`);
                } else {
                    // Insert new scheme
                    await client.query(`
                        INSERT INTO schemes (
                            external_id, slug, title, short_title, description,
                            ministry, department, category, level, tags,
                            target_beneficiaries, applicable_states,
                            open_date, close_date,
                            benefits, eligibility, application_process,
                            documents_required, faqs, contact_info,
                            status, last_updated, created_at
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::text[],
                            $11::text[], $12::text[], $13, $14, $15::jsonb, $16::jsonb, $17::jsonb,
                            $18::jsonb, $19::jsonb, $20::jsonb, $21, NOW(), NOW()
                        )
                    `, [
                        data.external_id, data.slug, data.title, data.short_title, data.description,
                        data.ministry, data.department, data.category, data.level, data.tags,
                        data.target_beneficiaries, data.applicable_states,
                        data.open_date, data.close_date,
                        data.benefits,
                        data.eligibility,
                        data.application_process,
                        data.documents_required,
                        data.faqs,
                        data.contact_info,
                        data.status
                    ]);

                    inserted++;
                    console.log(`✓ Inserted: ${data.title}`);
                }

            } catch (error) {
                console.error(`✗ Failed to process "${scheme.name}":`, error.message);
                skipped++;
            }
        }

        // Get total count
        const countResult = await client.query('SELECT COUNT(*) as total FROM schemes');
        const total = parseInt(countResult.rows[0].total);

        console.log('\n' + '='.repeat(50));
        console.log('📊 Summary:');
        console.log('='.repeat(50));
        console.log(`✓ Inserted: ${inserted} schemes`);
        console.log(`✓ Updated:  ${updated} schemes`);
        console.log(`✗ Skipped:  ${skipped} schemes`);
        console.log(`📈 Total in database: ${total} schemes`);
        console.log('='.repeat(50));
        console.log('\n🎉 Sample data loaded successfully!');
        console.log('\n📍 Next steps:');
        console.log('1. Navigate to http://localhost:3000');
        console.log('2. Click "Schemes" in the navigation');
        console.log('3. You should see the schemes displayed!');
        console.log('4. Try the filters, search, and eligibility checker\n');

    } catch (error) {
        console.error('\n❌ Error loading sample data:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the loader
loadSampleData()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
