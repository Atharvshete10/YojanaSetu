const RC = require('./src/services/crawlers/recruitmentsCrawler.js');
const c = new RC();
(async () => {
   const puppeteer = require('puppeteer');
   c.browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
   c.page = await c.browser.newPage();
   const res = await c.discoverRecruitments('Maharashtra');
   console.log("Returned array length:", res.length);
   if(res.length > 0) console.log("First item:", res[0]);
   await c.browser.close();
})();
