const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.all('SELECT normalized_data FROM crawl_results WHERE type = "scheme" AND status = "pending" ORDER BY created_at DESC LIMIT 1', (err, rows) => {
    if (err) return console.error(err);
    if (!rows || rows.length === 0) return console.log('No pending schemes found');
    const data = JSON.parse(rows[0].normalized_data);
    console.log('--- NORMALIZED DATA ---');
    console.log(JSON.stringify(data, null, 2));
});
