const {query} = require('./src/config/database');
async function run() {
    const db1 = await query('SELECT COUNT(1) AS c FROM schemes');
    const db2 = await query("SELECT COUNT(1) AS c FROM crawl_results WHERE type='scheme' AND status='pending'");
    let out = "Approved count: " + db1.rows[0].c + "\n";
    out += "Pending count: " + db2.rows[0].c + "\n";
    
    // Check duplicates directly
    const db3 = await query("SELECT json_extract(normalized_data, '$.external_id') as ext_id FROM crawl_results WHERE type='scheme' LIMIT 5");
    out += "Sample external_ids: " + JSON.stringify(db3.rows) + "\n";
    require('fs').writeFileSync('out2.json', out);
}
run();
