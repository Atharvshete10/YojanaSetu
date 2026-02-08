const http = require('http');

function makeRequest(path) {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log(`\nResponse for ${path}:`);
            console.log('Status:', res.statusCode);
            try {
                const json = JSON.parse(data);
                if (!json.success) {
                    console.log('Error Message:', json.message);
                    console.log('Full Stack:', json.stack); // This is what we need!
                } else {
                    console.log('Success! Data length:', json.data ? (Array.isArray(json.data) ? json.data.length : 'Object') : 'N/A');
                }
            } catch (e) {
                console.log('Raw Body:', data.substring(0, 500));
            }
        });
    });

    req.on('error', (e) => {
        console.error(`Problem with request to ${path}: ${e.message}`);
    });

    req.end();
}

console.log('Testing APIs...');
makeRequest('/api/schemes/filters');
makeRequest('/api/schemes/pmmy');
