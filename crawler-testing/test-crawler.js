const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

/**
 * Simple test crawler to explore government websites
 * Use this to test different URLs and selectors before finalizing
 */

class TestCrawler {
    constructor(config) {
        this.name = config.name;
        this.baseUrl = config.baseUrl;
        this.testUrl = config.testUrl;
    }

    async fetch(url) {
        try {
            console.log(`\n🔍 Fetching: ${url}`);
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            console.log(`✅ Status: ${response.status}`);
            console.log(`📄 Content-Type: ${response.headers['content-type']}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
            if (error.response) {
                console.error(`   Status: ${error.response.status}`);
            }
            throw error;
        }
    }

    async testEndpoint() {
        try {
            const data = await this.fetch(this.testUrl);

            // Check if it's JSON
            if (typeof data === 'object') {
                console.log('\n📊 JSON Response detected!');
                console.log('Sample data structure:');
                console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');

                // Save to file
                fs.writeFileSync(
                    `results/${this.name}-response.json`,
                    JSON.stringify(data, null, 2)
                );
                console.log(`\n💾 Full response saved to: results/${this.name}-response.json`);
            } else {
                // It's HTML
                console.log('\n🌐 HTML Response detected!');
                const $ = cheerio.load(data);

                // Save HTML
                fs.writeFileSync(`results/${this.name}-page.html`, data);
                console.log(`💾 HTML saved to: results/${this.name}-page.html`);

                // Analyze structure
                this.analyzeHTML($);
            }

            return data;
        } catch (error) {
            console.error(`\n❌ Test failed for ${this.name}`);
            return null;
        }
    }

    analyzeHTML($) {
        console.log('\n📋 HTML Structure Analysis:');

        // Find common containers
        const containers = [
            'table', 'div.card', 'div.scheme', 'article',
            'ul.list', 'div.item', 'div.row'
        ];

        containers.forEach(selector => {
            const count = $(selector).length;
            if (count > 0) {
                console.log(`  - ${selector}: ${count} found`);
            }
        });

        // Find links
        const links = $('a[href]');
        console.log(`\n🔗 Total links found: ${links.length}`);

        // Sample first few links
        console.log('\nSample links:');
        links.slice(0, 5).each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim().substring(0, 50);
            console.log(`  ${i + 1}. ${text} -> ${href}`);
        });

        // Find forms
        const forms = $('form');
        console.log(`\n📝 Forms found: ${forms.length}`);

        // Find tables
        const tables = $('table');
        console.log(`📊 Tables found: ${tables.length}`);
        if (tables.length > 0) {
            console.log('\nFirst table headers:');
            tables.first().find('th').each((i, el) => {
                console.log(`  - ${$(el).text().trim()}`);
            });
        }
    }

    async testSelector(selector, description) {
        console.log(`\n🎯 Testing selector: ${selector}`);
        console.log(`   Description: ${description}`);

        try {
            const html = await this.fetch(this.testUrl);
            const $ = cheerio.load(html);
            const elements = $(selector);

            console.log(`   Found: ${elements.length} elements`);

            if (elements.length > 0) {
                console.log('\n   Sample data from first 3 elements:');
                elements.slice(0, 3).each((i, el) => {
                    const text = $(el).text().trim().substring(0, 100);
                    console.log(`   ${i + 1}. ${text}...`);
                });
            }

            return elements.length;
        } catch (error) {
            console.error(`   ❌ Selector test failed: ${error.message}`);
            return 0;
        }
    }
}

// ============================================
// TEST CONFIGURATIONS
// ============================================

const testConfigs = [
    {
        name: 'myscheme',
        baseUrl: 'https://www.myscheme.gov.in',
        testUrl: 'https://www.myscheme.gov.in/find-scheme'
    },
    {
        name: 'eprocure',
        baseUrl: 'https://eprocure.gov.in',
        testUrl: 'https://eprocure.gov.in/eprocure/app'
    },
    {
        name: 'ncs',
        baseUrl: 'https://www.ncs.gov.in',
        testUrl: 'https://www.ncs.gov.in/Pages/default.aspx'
    }
];

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runTests() {
    console.log('🚀 Government Website Crawler Testing\n');
    console.log('='.repeat(60));

    // Create results directory
    if (!fs.existsSync('results')) {
        fs.mkdirSync('results');
    }

    for (const config of testConfigs) {
        console.log(`\n\n${'='.repeat(60)}`);
        console.log(`Testing: ${config.name.toUpperCase()}`);
        console.log('='.repeat(60));

        const crawler = new TestCrawler(config);
        await crawler.testEndpoint();

        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n\n✅ All tests completed!');
    console.log('📁 Check the results/ directory for saved responses');
}

// Run if called directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { TestCrawler };
