const axios = require('axios');

const API_BASE = 'https://api.myscheme.gov.in/schemes/v6/public';
const API_KEY = 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc';

async function testMetadata() {
    console.log('🕵️‍♀️ Testing Metadata Endpoints...\n');

    const endpoints = [
        '/ministries',
        '/states',
        '/categories',
        '/schemes/facets' // Sometimes search facets are here
    ];

    for (const ep of endpoints) {
        try {
            const url = `${API_BASE}${ep}`;
            const response = await axios.get(url, {
                headers: {
                    'x-api-key': API_KEY,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            console.log(`✅ ${ep}: Success! Status ${response.status}`);
            // console.log(JSON.stringify(response.data).substring(0, 100));
        } catch (error) {
            console.log(`❌ ${ep}: Failed (${error.response?.status || error.message})`);
        }
    }
}

testMetadata();
