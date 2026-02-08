const axios = require('axios');

const API_BASE = 'https://api.myscheme.gov.in/schemes/v6/public/schemes';
const API_KEY = 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc';

async function testMinistrySearch() {
    console.log('🕵️‍♀️ Testing Search by Ministry...\n');

    const params = {
        lang: 'en',
        q: '',
        page: 0,
        limit: 10,
        filters: JSON.stringify({
            ministry: ["Ministry of Finance"] // Trying a known ministry
        }),
        sortBy: 'popularity'
    };

    try {
        const response = await axios.get(API_BASE, {
            params,
            headers: {
                'x-api-key': API_KEY,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`✅ Success! Status: ${response.status}`);
        if (response.data?.data?.items) {
            console.log(`🎉 Found ${response.data.data.items.length} schemes!`);
            response.data.data.items.forEach(s => console.log(`   - ${s.fields.slug}`));
        }
    } catch (error) {
        console.log(`❌ Failed: ${error.message} (${error.response?.data?.errorDescription || error.response?.status})`);
        // console.log(JSON.stringify(error.response?.data));
    }
}

testMinistrySearch();
