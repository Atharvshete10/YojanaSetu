const {query} = require('./src/config/database');
const Crawler = require('./src/services/crawlers/schemesCrawler');

async function r() {
  await query("DELETE FROM schemes WHERE slug='pm-kisan'");
  await query("DELETE FROM crawl_results WHERE json_extract(normalized_data, '$.slug')='pm-kisan'");
  const c = new Crawler();
  try {
    const res = await c.fetchAndSaveScheme('pm-kisan');
    console.log("Result:", res);
  } catch(e) {
    console.error(e);
  }
}
r();
