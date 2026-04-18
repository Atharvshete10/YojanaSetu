const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
const SchemesCrawler = require('./src/services/crawlers/schemesCrawler');

db.run('DELETE FROM schemes WHERE slug = "nos-swd"', err => {
    if(err) console.error(err);
    else console.log('Successfully deleted approved scheme "nos-swd". Now crawling...');
    
    const crawler = new SchemesCrawler();
    crawler.fetchAndSaveScheme('nos-swd').then(res => {
        console.log('Crawling done:', res);
        
        db.all('SELECT status, json_extract(normalized_data, "$.title") as title FROM crawl_results WHERE type="scheme" AND status="pending" ORDER BY id DESC LIMIT 1', (e, rows) => {
            console.log('Final DB Entry:', rows);
        });
    });
});
