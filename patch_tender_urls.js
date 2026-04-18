const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
});

console.log('Updating existing tenders to point to the official web portal...');

// For the `tenders` table we append `#` + tender_id to avoid UNIQUE constraint violations.
db.run("UPDATE tenders SET source_url = 'https://eprocure.gov.in/cppp/tendersearch#' || tender_id WHERE source_url LIKE '/tender_docs/%'", [], function(err) {
    if (err) {
        console.error('Error updating tenders table:', err);
    } else {
        console.log(`Updated ${this.changes} rows in 'tenders' table.`);
    }

    // For `crawl_results` we do a similar fix. However since it's JSON we can extract the tender_id from normalized_data.
    db.run("UPDATE crawl_results SET normalized_data = json_set(normalized_data, '$.source_url', 'https://eprocure.gov.in/cppp/tendersearch#' || json_extract(normalized_data, '$.tender_id')) WHERE type = 'tender' AND json_extract(normalized_data, '$.source_url') LIKE '/tender_docs/%'", [], function(err2) {
        if (err2) {
            console.error('Error updating crawl_results table:', err2);
        } else {
            console.log(`Updated ${this.changes} rows in 'crawl_results' table.`);
        }
        db.close();
    });
});
