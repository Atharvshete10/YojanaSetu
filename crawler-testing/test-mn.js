const puppeteer = require('puppeteer');

async function testMN() {
    const browser = await puppeteer.launch({headless: 'new'});
    const page = await browser.newPage();
    await page.goto('https://majhinaukri.in/', {waitUntil: 'domcontentloaded'});
    
    const data = await page.evaluate(() => {
        const jobs = [];
        // Majhi naukri usually uses figure class="wp-block-table" or similar
        const rows = document.querySelectorAll('tr');
        for(let tr of rows) {
            const a = tr.querySelector('a');
            if(a && a.innerText) {
                jobs.push({
                    title: a.innerText.trim(),
                    link: a.href,
                    text: tr.innerText.replace(/\n/g, ' ')
                });
            }
        }
        return jobs.slice(0, 10);
    });
    console.log(JSON.stringify(data, null, 2));
    await browser.close();
}

testMN();
