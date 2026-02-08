const axios = require('axios');

// Configuration from your .env
const API_BASE = 'https://api.myscheme.gov.in/schemes/v6/public/schemes';
const API_KEY = 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc';

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

async function testSearchEndpoint() {
    console.log('🕵️‍♀️ Testing API Validation Fixes...\n');

    // From your code snippet: 
    // Q(encodeURIComponent(JSON.stringify(O.filters)), encodeURIComponent(O.query || ""), O.sortBy, O.page, "default", ne)
    // This implies query params: filters, query, sortBy, page

    const variations = [
        {
            name: '1. Filters as Empty Array',
            method: 'GET',
            params: {
                lang: 'en',
                q: '',
                page: 0,
                limit: 10,
                filters: JSON.stringify([]) // Try array
            }
        },
        {
            name: '2. No Filters Param',
            method: 'GET',
            params: {
                lang: 'en',
                q: '',
                page: 0,
                limit: 10
            }
        },
        {
            name: '3. Scheme Content True',
            method: 'GET',
            params: {
                lang: 'en',
                q: '',
                page: 0,
                limit: 10,
                schemeContent: true
            }
        },
        {
            name: '4. Without Page/Limit',
            method: 'GET',
            params: {
                lang: 'en'
            }
        }
    ];

    for (const test of variations) {
        console.log(`--- Testing: ${test.name} ---`);
        try {
            const config = {
                method: test.method || 'GET',
                url: API_BASE, // Trying base URL first
                params: test.params,
                data: test.data,
                headers: {
                    'x-api-key': API_KEY,
                    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 5000 // 5s timeout
            };

            // Log the full URL for inspection
            if (config.method === 'GET') {
                const searchParams = new URLSearchParams(config.params);
                console.log(`URL: ${config.url}?${searchParams.toString()}`);
            }

            const response = await axios(config);

            console.log(`✅ Success! Status: ${response.status}`);
            if (response.data && response.data.data && Array.isArray(response.data.data.items)) {
                console.log(`🎉 Found ${response.data.data.items.length} schemes!`);
                console.log('First 3 slugs found:');
                response.data.data.items.slice(0, 3).forEach(s => console.log(`   - ${s.fields?.slug || s.slug}`));

                // If this works, we found the key!
                return;
            } else {
                console.log('⚠️  Response structure unexpected:', JSON.stringify(response.data).substring(0, 100) + '...');
            }

        } catch (error) {
            console.log(`❌ Failed: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data: ${JSON.stringify(error.response.data)}`);
            }
        }
        console.log('\n');
    }
}

testSearchEndpoint();
