// Test MyScheme API connection
const https = require('https');

const options = {
    hostname: 'api.myscheme.gov.in',
    path: '/schemes/v6/public/schemes?limit=5&offset=0&lang=en',
    method: 'GET',
    headers: {
        'x-api-key': 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc',
        'User-Agent': 'YojanaSetu-Bot/1.0'
    }
};

console.log('Testing MyScheme API...');
console.log('URL:', `https://${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log('\n✓ API Response Success!');
            console.log('Total schemes available:', parsed.total || 'N/A');
            console.log('Schemes in response:', parsed.data?.length || 0);
            if (parsed.data && parsed.data.length > 0) {
                console.log('\nFirst scheme:');
                console.log('- ID:', parsed.data[0]._id);
                console.log('- Title:', parsed.data[0].title);
            }
        } catch (e) {
            console.error('\n✗ Failed to parse response');
            console.error('Raw response:', data.substring(0, 500));
        }
    });
});

req.on('error', (error) => {
    console.error('\n✗ API Request Failed:');
    console.error(error.message);
});

req.setTimeout(10000, () => {
    console.error('\n✗ Request timeout');
    req.abort();
});

req.end();
