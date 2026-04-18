const axios = require('axios');

async function testNCS() {
    try {
        const payload = { "isGovernmentJob": true, "sortBy": "RELEVANCE" };
        const response = await axios.post('https://betacloud.ncs.gov.in/api/v1/job-posts/search?page=0&size=5', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log(JSON.stringify(response.data.data.content[0], null, 2));
    } catch(e) {
        console.error(e.message);
    }
}

testNCS();
