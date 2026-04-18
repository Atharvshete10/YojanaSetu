const {query} = require('./src/config/database');
async function run() {
    const db1 = await query("SELECT COUNT(1) AS c FROM crawl_results WHERE type='scheme'");
    let out = "Total crawl_results for scheme: " + db1.rows[0].c + "\n";
    require('fs').writeFileSync('out3.json', out);
}
run();
