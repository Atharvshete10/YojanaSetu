const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../YojanaSetu/.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function saveSchemes() {
    let client;
    try {
        console.log('Connecting to database...');
        client = await pool.connect();
        console.log('Connected.');

        const resultsDir = path.join(__dirname, 'results');
        if (!fs.existsSync(resultsDir)) {
            console.error('Results directory not found!');
            return;
        }

        const files = fs.readdirSync(resultsDir).filter(f => f.startsWith('scheme-') && f.endsWith('.json'));
        console.log(`Found ${files.length} scheme files.`);

        let savedCount = 0;
        let errorCount = 0;

        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(resultsDir, file), 'utf8');
                const json = JSON.parse(content);

                if (json.status !== 'Success' || !json.data) {
                    console.log(`Skipping ${file}: Invalid status or no data`);
                    continue;
                }

                const data = json.data;
                const details = data.en.basicDetails;
                const contentData = data.en.schemeContent;

                // Construct the scheme object mapping
                // Use safe access (?.) for optional fields
                const scheme = {
                    external_id: data._id,
                    slug: data.slug,
                    title: details.schemeName,
                    short_title: details.schemeShortTitle,
                    description: contentData.briefDescription,
                    detailed_description: contentData.detailedDescription, // JSONB
                    ministry: details.nodalMinistryName?.label,
                    department: details.nodalDepartmentName?.label,
                    category: details.schemeCategory?.[0]?.label,
                    sub_category: details.schemeSubCategory?.map(sc => sc.label) || [],
                    level: details.level?.label,
                    scheme_type: details.schemeType?.label,
                    tags: details.tags || [],
                    target_beneficiaries: details.targetBeneficiaries?.map(b => b.label) || [],
                    open_date: details.schemeOpenDate,

                    // JSONB fields
                    benefits: contentData.benefits || [],
                    eligibility: data.en.eligibilityCriteria || {},
                    application_process: contentData.applicationProcess || [],
                    documents_required: [], // Structure varies, keeping empty for now
                    faqs: [], // Not seen in example
                    references: contentData.references || [],

                    applicable_states: details.level?.value === 'central' ? ['All India'] : (details.state ? [details.state] : []),
                    status: 'approved',
                    raw_data: data // Store original JSON for reference
                };

                const query = `
                    INSERT INTO schemes (
                        "external_id", "slug", "title", "short_title", "description", "detailed_description",
                        "ministry", "department", "category", "sub_category", "level", "scheme_type",
                        "tags", "target_beneficiaries", "open_date",
                        "benefits", "eligibility", "application_process", "documents_required", "references",
                        "applicable_states", "status", "raw_data",
                        "updated_at"
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6,
                        $7, $8, $9, $10, $11, $12,
                        $13, $14, $15,
                        $16, $17, $18, $19, $20,
                        $21, $22, $23,
                        NOW()
                    )
                    ON CONFLICT (slug) DO UPDATE SET
                        "title" = EXCLUDED.title,
                        "short_title" = EXCLUDED.short_title,
                        "description" = EXCLUDED.description,
                        "detailed_description" = EXCLUDED.detailed_description,
                        "ministry" = EXCLUDED.ministry,
                        "department" = EXCLUDED.department,
                        "category" = EXCLUDED.category,
                        "sub_category" = EXCLUDED.sub_category,
                        "level" = EXCLUDED.level,
                        "scheme_type" = EXCLUDED.scheme_type,
                        "tags" = EXCLUDED.tags,
                        "target_beneficiaries" = EXCLUDED.target_beneficiaries,
                        "open_date" = EXCLUDED.open_date,
                        "benefits" = EXCLUDED.benefits,
                        "eligibility" = EXCLUDED.eligibility,
                        "application_process" = EXCLUDED.application_process,
                        "references" = EXCLUDED.references,
                        "applicable_states" = EXCLUDED.applicable_states,
                        "raw_data" = EXCLUDED.raw_data,
                        "updated_at" = NOW()
                    RETURNING id;
                `;

                const values = [
                    scheme.external_id, scheme.slug, scheme.title, scheme.short_title, scheme.description, JSON.stringify(scheme.detailed_description),
                    scheme.ministry, scheme.department, scheme.category, scheme.sub_category, scheme.level, scheme.scheme_type,
                    scheme.tags, scheme.target_beneficiaries, scheme.open_date,
                    JSON.stringify(scheme.benefits), JSON.stringify(scheme.eligibility), JSON.stringify(scheme.application_process), JSON.stringify(scheme.documents_required), JSON.stringify(scheme.references),
                    scheme.applicable_states, scheme.status, JSON.stringify(scheme.raw_data)
                ];

                await client.query(query, values);
                // process.stdout.write(`.` ); // Progress dot
                savedCount++;
            } catch (err) {
                console.error(`\nError processing ${file}:`, err.message);
                errorCount++;
            }
        }

        console.log(`\n\n✅ Database update complete!`);
        console.log(`Saved/Updated: ${savedCount}`);
        console.log(`Failed: ${errorCount}`);

    } catch (err) {
        console.error('Fatal Error:', err);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

saveSchemes();
