const axios = require('axios');
const fs = require('fs');

/**
 * Test MyScheme.gov.in API with the discovered endpoints
 */

const API_BASE = 'https://api.myscheme.gov.in/schemes/v6/public/schemes';
const API_KEY = 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc';

const headers = {
    'x-api-key': API_KEY,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

async function testSchemeBySlug(slug, lang = 'en') {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Testing: Get Scheme by Slug - "${slug}"`);
    console.log('='.repeat(70));

    try {
        const url = `${API_BASE}?slug=${slug}&lang=${lang}`;
        console.log(`📍 URL: ${url}`);

        const response = await axios.get(url, { headers });

        console.log(`✅ Status: ${response.status}`);
        console.log(`📊 Status Code: ${response.data.statusCode}`);

        if (response.data.statusCode === 200 && response.data.data) {
            const scheme = response.data.data;
            const langData = scheme[lang];

            console.log(`\n📋 Scheme Details:`);
            console.log(`   ID: ${scheme._id}`);
            console.log(`   Slug: ${scheme.slug}`);
            console.log(`   Name: ${langData?.basicDetails?.schemeName}`);
            console.log(`   Description: ${langData?.schemeContent?.briefDescription?.substring(0, 100)}...`);
            console.log(`   Tags: ${langData?.basicDetails?.tags?.join(', ')}`);

            // Save full response
            fs.writeFileSync(
                `results/scheme-${slug}.json`,
                JSON.stringify(response.data, null, 2)
            );
            console.log(`\n💾 Full response saved to: results/scheme-${slug}.json`);

            return scheme;
        } else {
            console.log(`❌ No data found or error`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data: ${JSON.stringify(error.response.data)}`);
        }
        return null;
    }
}

async function testSchemeDocuments(schemeId, lang = 'en') {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Testing: Get Scheme Documents`);
    console.log('='.repeat(70));

    try {
        const url = `${API_BASE}/${schemeId}/documents?lang=${lang}`;
        console.log(`📍 URL: ${url}`);

        const response = await axios.get(url, { headers });

        console.log(`✅ Status: ${response.status}`);
        console.log(`📊 Status Code: ${response.data.statusCode}`);

        if (response.data.statusCode === 200 && response.data.data) {
            const docs = response.data.data[lang]?.documents_required || [];
            console.log(`\n📄 Documents Required: ${docs.length}`);
            docs.slice(0, 3).forEach((doc, i) => {
                console.log(`   ${i + 1}. ${doc.documentName}`);
            });

            return docs;
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

async function testSchemeFAQs(schemeId, lang = 'en') {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Testing: Get Scheme FAQs`);
    console.log('='.repeat(70));

    try {
        const url = `${API_BASE}/${schemeId}/faqs?lang=${lang}`;
        console.log(`📍 URL: ${url}`);

        const response = await axios.get(url, { headers });

        console.log(`✅ Status: ${response.status}`);
        console.log(`📊 Status Code: ${response.data.statusCode}`);

        if (response.data.statusCode === 200 && response.data.data) {
            const faqs = response.data.data[lang]?.faqs || [];
            console.log(`\n❓ FAQs: ${faqs.length}`);
            faqs.slice(0, 2).forEach((faq, i) => {
                console.log(`   ${i + 1}. Q: ${faq.question}`);
                console.log(`      A: ${faq.answer.substring(0, 80)}...`);
            });

            return faqs;
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

async function testApplicationChannels(schemeId) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Testing: Get Application Channels`);
    console.log('='.repeat(70));

    try {
        const url = `${API_BASE}/${schemeId}/applicationchannel`;
        console.log(`📍 URL: ${url}`);

        const response = await axios.get(url, { headers });

        console.log(`✅ Status: ${response.status}`);
        console.log(`📊 Status Code: ${response.data.statusCode}`);

        if (response.data.statusCode === 200 && response.data.data) {
            const channels = response.data.data.applicationChannel || [];
            console.log(`\n🔗 Application Channels: ${channels.length}`);
            channels.forEach((channel, i) => {
                console.log(`   ${i + 1}. ${channel.applicationName}: ${channel.applicationUrl}`);
            });

            return channels;
        }
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

async function testListAllSchemes() {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`Testing: List All Schemes (Finding the endpoint)`);
    console.log('='.repeat(70));

    const possibleEndpoints = [
        `${API_BASE}`,
        `${API_BASE}/list`,
        `${API_BASE}/all`,
        'https://api.myscheme.gov.in/schemes/v6/public/search',
        `${API_BASE}?limit=10`,
        `${API_BASE}?page=1&limit=10`
    ];

    for (const endpoint of possibleEndpoints) {
        try {
            console.log(`\n🔍 Trying: ${endpoint}`);
            const response = await axios.get(endpoint, { headers, timeout: 5000 });

            console.log(`   ✅ Success! Status: ${response.status}`);
            console.log(`   📊 Response has data: ${!!response.data}`);

            if (response.data && Array.isArray(response.data.data)) {
                console.log(`   🎉 FOUND IT! This endpoint returns a list of schemes!`);
                console.log(`   📋 Number of schemes: ${response.data.data.length}`);

                fs.writeFileSync(
                    'results/all-schemes.json',
                    JSON.stringify(response.data, null, 2)
                );
                console.log(`   💾 Saved to: results/all-schemes.json`);

                return endpoint;
            }
        } catch (error) {
            console.log(`   ❌ ${error.response?.status || error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n⚠️  Could not find "list all schemes" endpoint`);
    console.log(`   You may need to check the Network tab manually`);
}

async function main() {
    console.log('🚀 MyScheme.gov.in API Testing\n');

    // Create results directory
    if (!fs.existsSync('results')) {
        fs.mkdirSync('results');
    }

    // Test with a known scheme slug
    const testSlugs = ['pmmy', 'sui', 'pmjdy'];

    for (const slug of testSlugs) {
        const scheme = await testSchemeBySlug(slug);

        if (scheme && scheme._id) {
            // Test related endpoints
            await testSchemeDocuments(scheme._id);
            await testSchemeFAQs(scheme._id);
            await testApplicationChannels(scheme._id);
        }

        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Try to find the "list all schemes" endpoint
    await testListAllSchemes();

    console.log('\n\n✅ All tests completed!');
    console.log('📁 Check the results/ directory for saved responses');
    console.log('\n💡 Next step: Find the "list all schemes" endpoint by:');
    console.log('   1. Going to https://www.myscheme.gov.in/search');
    console.log('   2. Opening DevTools Network tab');
    console.log('   3. Looking for API calls that return multiple schemes');
}

main().catch(console.error);
