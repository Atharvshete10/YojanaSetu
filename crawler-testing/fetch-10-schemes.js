const axios = require('axios');
const fs = require('fs');

/**
 * Fetch 10 schemes from MyScheme.gov.in API for verification
 */

const API_BASE = 'https://api.myscheme.gov.in/schemes/v6/public/schemes';
const API_KEY = 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc';

const headers = {
    'x-api-key': API_KEY,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

async function fetch10Schemes() {
    console.log('🚀 Fetching 10 Schemes from MyScheme.gov.in\n');
    console.log('='.repeat(70));

    try {
        // Try different endpoints to get a list
        const endpoints = [
            `${API_BASE}?limit=10&lang=en`,
            `${API_BASE}?page=1&limit=10&lang=en`,
            `${API_BASE}/list?limit=10&lang=en`
        ];

        let schemes = [];
        let successEndpoint = null;

        for (const endpoint of endpoints) {
            try {
                console.log(`\n🔍 Trying: ${endpoint}`);
                const response = await axios.get(endpoint, { headers, timeout: 10000 });

                if (response.data && response.data.data) {
                    const data = response.data.data;

                    // Check if it's an array of schemes
                    if (Array.isArray(data)) {
                        schemes = data.slice(0, 10);
                        successEndpoint = endpoint;
                        console.log(`✅ Success! Found ${data.length} schemes`);
                        break;
                    }
                }
            } catch (error) {
                console.log(`   ❌ ${error.response?.status || error.message}`);
            }
        }

        // If we couldn't get a list, fetch individual schemes by known slugs
        if (schemes.length === 0) {
            console.log('\n⚠️  Could not find list endpoint, fetching individual schemes...\n');

            const knownSlugs = [
                'pmmy', 'sui', 'pmjdy', 'pmay', 'pmksy',
                'pmjjby', 'pmsby', 'apy', 'pmegp', 'nsap'
            ];

            for (const slug of knownSlugs) {
                try {
                    console.log(`   Fetching: ${slug}...`);
                    const response = await axios.get(
                        `${API_BASE}?slug=${slug}&lang=en`,
                        { headers, timeout: 5000 }
                    );

                    if (response.data.statusCode === 200 && response.data.data) {
                        schemes.push(response.data.data);
                        console.log(`   ✅ ${slug}`);
                    }
                } catch (error) {
                    console.log(`   ❌ ${slug} - ${error.message}`);
                }

                // Wait between requests
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        if (schemes.length === 0) {
            console.log('\n❌ Could not fetch any schemes');
            return;
        }

        console.log(`\n\n✅ Successfully fetched ${schemes.length} schemes!`);
        console.log('='.repeat(70));

        // Save full data
        fs.writeFileSync(
            'results/10-schemes-full.json',
            JSON.stringify(schemes, null, 2)
        );
        console.log('\n💾 Full data saved to: results/10-schemes-full.json');

        // Create a summary for easy verification
        const summary = schemes.map((scheme, index) => {
            const langData = scheme.en || scheme.hi || {};
            const basicDetails = langData.basicDetails || {};
            const schemeContent = langData.schemeContent || {};
            const eligibility = langData.eligibilityCriteria || {};

            return {
                index: index + 1,
                id: scheme._id,
                slug: scheme.slug,
                name: basicDetails.schemeName || 'N/A',
                shortTitle: basicDetails.schemeShortTitle || 'N/A',
                ministry: basicDetails.nodalMinistryName?.label || 'N/A',
                department: basicDetails.nodalDepartmentName?.label || 'N/A',
                category: basicDetails.schemeCategory?.[0]?.label || 'N/A',
                level: basicDetails.level?.label || 'N/A',
                description: (schemeContent.briefDescription || '').substring(0, 200) + '...',
                benefits: (schemeContent.benefits_md || '').substring(0, 150) + '...',
                eligibility: (eligibility.eligibilityDescription_md || '').substring(0, 150) + '...',
                tags: basicDetails.tags || [],
                openDate: basicDetails.schemeOpenDate || 'N/A',
                closeDate: basicDetails.schemeCloseDate || 'Open',
                targetBeneficiaries: basicDetails.targetBeneficiaries?.map(t => t.label) || []
            };
        });

        // Save summary
        fs.writeFileSync(
            'results/10-schemes-summary.json',
            JSON.stringify(summary, null, 2)
        );
        console.log('💾 Summary saved to: results/10-schemes-summary.json');

        // Create a readable text file
        let textReport = '# MyScheme.gov.in - 10 Schemes Verification Report\n\n';
        textReport += `Generated: ${new Date().toLocaleString()}\n`;
        textReport += `Total Schemes: ${schemes.length}\n`;
        textReport += `API Endpoint: ${successEndpoint || 'Individual fetches'}\n\n`;
        textReport += '='.repeat(80) + '\n\n';

        summary.forEach(scheme => {
            textReport += `## ${scheme.index}. ${scheme.name}\n\n`;
            textReport += `**Slug**: ${scheme.slug}\n`;
            textReport += `**Short Title**: ${scheme.shortTitle}\n`;
            textReport += `**ID**: ${scheme.id}\n`;
            textReport += `**Ministry**: ${scheme.ministry}\n`;
            textReport += `**Department**: ${scheme.department}\n`;
            textReport += `**Category**: ${scheme.category}\n`;
            textReport += `**Level**: ${scheme.level}\n`;
            textReport += `**Tags**: ${scheme.tags.join(', ')}\n`;
            textReport += `**Open Date**: ${scheme.openDate}\n`;
            textReport += `**Close Date**: ${scheme.closeDate}\n`;
            textReport += `**Target Beneficiaries**: ${scheme.targetBeneficiaries.join(', ')}\n\n`;
            textReport += `**Description**:\n${scheme.description}\n\n`;
            textReport += `**Benefits**:\n${scheme.benefits}\n\n`;
            textReport += `**Eligibility**:\n${scheme.eligibility}\n\n`;
            textReport += '-'.repeat(80) + '\n\n';
        });

        fs.writeFileSync('results/10-schemes-report.txt', textReport);
        console.log('💾 Readable report saved to: results/10-schemes-report.txt');

        // Print summary to console
        console.log('\n\n📋 SCHEMES SUMMARY');
        console.log('='.repeat(80));
        summary.forEach(scheme => {
            console.log(`\n${scheme.index}. ${scheme.name}`);
            console.log(`   Slug: ${scheme.slug}`);
            console.log(`   Ministry: ${scheme.ministry}`);
            console.log(`   Category: ${scheme.category}`);
            console.log(`   Level: ${scheme.level}`);
            console.log(`   Tags: ${scheme.tags.join(', ')}`);
        });

        console.log('\n\n✅ All files saved successfully!');
        console.log('\n📁 Files created:');
        console.log('   - results/10-schemes-full.json (Complete API response)');
        console.log('   - results/10-schemes-summary.json (Structured summary)');
        console.log('   - results/10-schemes-report.txt (Human-readable report)');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        }
    }
}

// Run
fetch10Schemes().catch(console.error);
