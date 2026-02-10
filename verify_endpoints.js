const http = require('http');

const endpoints = [
    { name: 'Home', path: '/' },
    { name: 'Schemes API', path: '/api/schemes' },
    { name: 'Admin Portal', path: '/admin' }
];

async function verify() {
    for (const endpoint of endpoints) {
        try {
            const res = await new Promise((resolve, reject) => {
                http.get(`http://localhost:3000${endpoint.path}`, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve({ status: res.statusCode, data }));
                }).on('error', reject);
            });
            console.log(`${endpoint.name}: Status ${res.status}`);
            if (endpoint.path === '/api/schemes') {
                const json = JSON.parse(res.data);
                console.log(`Schemes count: ${json.data ? json.data.length : 'N/A'}`);
            }
        } catch (error) {
            console.log(`${endpoint.name}: FAILED - ${error.message}`);
        }
    }
}

verify();
