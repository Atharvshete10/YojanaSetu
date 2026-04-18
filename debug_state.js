const { query } = require('./src/config/database');
async function test() {
    try {
        const res = await query("SELECT id, post_name, state FROM recruitments WHERE status='approved'");
        console.log("Approved recruits:", res.rows);
    } catch(err) {
        console.error(err);
    }
}
test();
