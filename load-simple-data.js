/**
 * Simple Sample Data Loader for YojanaSetu
 * Loads 10 test schemes with minimal required fields
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

function createSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function loadSampleData() {
    const client = await pool.connect();

    try {
        console.log('🚀 Loading sample schemes...\n');

        const dataPath = path.join(__dirname, '..', 'crawler-testing', 'results', '10-schemes-summary.json');
        const schemes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        console.log(`Found ${schemes.length} schemes\n`);

        let inserted = 0;

        for (const scheme of schemes) {
            try {
                const slug = scheme.slug || createSlug(scheme.name);

                // Check if exists
                const exists = await client.query('SELECT id FROM schemes WHERE slug = $1', [slug]);

                if (exists.rows.length > 0) {
                    console.log(`⏭️  Skipped (exists): ${scheme.name}`);
                    continue;
                }

                // Insert with minimal required fields
                await client.query(`
                    INSERT INTO schemes (
                        external_id, slug, title, description,
                        ministry, category, level,
                        tags, applicable_states,
                        status, created_at, updated_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7,
                        $8::text[], $9::text[],
                        'approved', NOW(), NOW()
                    )
                `, [
                    scheme.id || `sample-${Date.now()}`,
                    slug,
                    scheme.name || 'Untitled Scheme',
                    scheme.description || 'No description',
                    scheme.ministry || 'Unknown Ministry',
                    scheme.category || 'General',
                    scheme.level || 'Central',
                    scheme.tags || [],
                    ['All India']
                ]);

                inserted++;
                console.log(`✓ Inserted: ${scheme.name}`);

            } catch (error) {
                console.error(`✗ Failed: ${scheme.name} - ${error.message}`);
            }
        }

        const total = await client.query('SELECT COUNT(*) as count FROM schemes');

        console.log('\n' + '='.repeat(60));
        console.log(`✓ Inserted ${inserted} new schemes`);
        console.log(`📊 Total schemes in database: ${total.rows[0].count}`);
        console.log('='.repeat(60));
        console.log('\n🎉 Done! Visit http://localhost:3000 and click "Schemes"\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

loadSampleData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
