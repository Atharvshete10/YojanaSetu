const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = 'c:/Users/athar/OneDrive/Desktop/CEP3/database.sqlite';
const db = new sqlite3.Database(dbPath);

db.all("SELECT * FROM crawler_jobs ORDER BY started_at DESC LIMIT 10", (err, rows) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('--- CRAWLER JOBS ---');
    rows.forEach(r => {
        console.log(`ID: ${r.id} | Type: ${r.job_type} | Status: ${r.status} | Started: ${r.started_at} | Fetched: ${r.total_fetched}`);
    });

    db.all("SELECT * FROM crawler_status WHERE id = 1", (err, statusRows) => {
        if (err) {
            console.error(err);
        } else {
            console.log('\n--- CRAWLER STATUS ---');
            console.log(JSON.stringify(statusRows, null, 2));
        }
        db.close();
    });
});
