const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.myscheme.gov.in/search?q=Gujarat', {waitUntil: 'networkidle2'});
    const hrefs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('myscheme.gov.in'));
    });
    console.log("Found links:", hrefs.filter(h => h.includes('/schemes/')));
    await browser.close();
})();
