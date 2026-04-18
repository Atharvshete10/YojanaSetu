const fs = require('fs');
const html = fs.readFileSync('tender_detail_test.html', 'utf-8');
const links = html.match(/href="([^"]+)"/g);
if (links) {
    const filtered = links.map(l => l.replace(/href="|"/g, '')).filter(l => l.includes('download') || l.includes('pdf') || l.includes('doc') || l.includes('DownLoad'));
    console.log(filtered);
} else {
    console.log('No links');
}
