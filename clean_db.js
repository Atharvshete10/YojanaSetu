const { query } = require('./src/config/database');
async function clean() {
    try {
        await query("DELETE FROM recruitments");
        await query("DELETE FROM crawl_results WHERE type='recruitment'");
        console.log("DB cleaned");
    } catch(e) { console.error(e); }
}
clean();
