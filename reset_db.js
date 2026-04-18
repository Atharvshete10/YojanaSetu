const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
const fallbackSlugs = [
    'pmmy', 'sui', 'pmjdy', 'pmay', 'pmksy',
    'pmjjby', 'pmsby', 'apy', 'pmegp', 'nsap',
    'ayushman-bharat', 'swachh-bharat', 'skill-india',
    'make-in-india', 'digital-india', 'startup-india',
    'kisan-vikas-patra', 'sukanya-samriddhi-yojana'
];

db.serialize(() => {
    const placeholders = fallbackSlugs.map(() => '?').join(',');
    db.run(`DELETE FROM schemes WHERE slug IN (${placeholders})`, fallbackSlugs, function(err) {
        if (err) console.error('Error deleting schemes:', err);
        else console.log(`Deleted ${this.changes} approved fallback schemes.`);
    });
    
    db.run(`DELETE FROM crawl_results WHERE json_extract(normalized_data, '$.slug') IN (${placeholders})`, fallbackSlugs, function(err) {
        if (err) console.error('Error deleting crawl results:', err);
        else console.log(`Deleted ${this.changes} pending/approved fallback crawl results.`);
    });
});
