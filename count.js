const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.get("SELECT COUNT(1) as c FROM tenders WHERE status = 'approved'", [], (err, row) => {
    console.log("Tenders count:", row ? row.c : err);
    db.close();
});
