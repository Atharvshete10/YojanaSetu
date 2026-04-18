
const fs = require('fs');
const token = JSON.parse(fs.readFileSync('status_output.json', 'utf8').replace(/^\uFEFF/, '')).token;

fetch('http://localhost:3000/api/admin/crawler/tenders/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ batch_size: 15 })
})
.then(r => r.json())
.then(data => console.log('START RESPONSE:', data))
.catch(console.error);
