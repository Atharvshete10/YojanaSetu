const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        await page.goto('https://eprocure.gov.in/cppp/latestactivetendersnew/cpppdata', {waitUntil: 'networkidle2'});
        const link = await page.evaluate(() => document.querySelector('.list_table a').href);
        console.log('Tender Full View Link:', link);
        
        await page.goto(link, {waitUntil: 'networkidle2'});
        const extract = await page.evaluate(() => {
            const forms = Array.from(document.querySelectorAll('form'));
            const downloadLink = document.querySelector('a[href*="download"]');
            return {
                action: forms.length > 0 ? forms[0].action : 'none',
                formsHtml: forms.map(f => f.outerHTML),
                downloadHref: downloadLink ? downloadLink.href : 'none'
            };
        });
        
        console.log(JSON.stringify(extract, null, 2));
    } catch (e) {
        console.error(e);
    }
    await browser.close();
})();
