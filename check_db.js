const { query } = require('./src/config/database');
async function check() {
    const r1 = await query("SELECT * FROM crawl_results WHERE type='recruitment'");
    const r2 = await query("SELECT * FROM recruitments");
    console.log("Crawl:", r1.rows.length, "Recruits:", r2.rows.length);
    if(r2.rows.length > 0) console.log(r2.rows[0]);
}
check().catch(console.error);
