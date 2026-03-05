const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('c:/Users/athar/OneDrive/Desktop/CEP3/database.sqlite');
db.all("PRAGMA table_info(crawler_jobs)", (err, rows) => {
    if (err) console.error(err);
    else console.log('TABLE INFO:', JSON.stringify(rows, null, 2));

    db.all("SELECT sql FROM sqlite_master WHERE name='crawler_jobs'", (err2, rows2) => {
        if (err2) console.error(err2);
        else console.log('\nCREATE SQL:', rows2[0]?.sql);
        db.close();
    });
});
