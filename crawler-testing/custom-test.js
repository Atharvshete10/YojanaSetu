const { TestCrawler } = require('./test-crawler');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

/**
 * MyScheme.gov.in Deep Analysis
 * Finding actual API endpoints and data structure
 */

async function analyzeMyScheme() {
    console.log('🔍 Deep Analysis of MyScheme.gov.in\n');
    console.log('='.repeat(70));

    // Test the search page
    const searchUrl = 'https://www.myscheme.gov.in/search';

    console.log(`\n📍 Testing: ${searchUrl}\n`);

    try {
        const response = await axios.get(searchUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });

        console.log(`✅ Status: ${response.status}`);
        console.log(`📄 Content-Type: ${response.headers['content-type']}\n`);

        const html = response.data;
        const $ = cheerio.load(html);

        // Save the HTML
        fs.writeFileSync('results/myscheme-search.html', html);
        console.log('💾 HTML saved to: results/myscheme-search.html\n');

        // Analyze the page structure
        console.log('📋 PAGE ANALYSIS');
        console.log('='.repeat(70));

        // Look for scheme cards/items
        console.log('\n🎯 Looking for scheme containers...');
        const possibleContainers = [
            '.scheme-card',
            '.scheme-item',
            'div.card',
            'article',
            '.result-item',
            '.search-result',
            'div[class*="scheme"]',
            'div[class*="card"]'
        ];

        possibleContainers.forEach(selector => {
            const count = $(selector).length;
            if (count > 0) {
                console.log(`  ✓ ${selector}: ${count} found`);

                // Show sample data
                $(selector).first().each((i, el) => {
                    const text = $(el).text().trim().substring(0, 150);
                    console.log(`    Sample: ${text}...`);
                });
            }
        });

        // Look for API calls in script tags
        console.log('\n🔍 Looking for API endpoints in scripts...');
        const scripts = $('script').map((i, el) => $(el).html()).get();
        const apiPatterns = [
            /api[\/\w-]*/gi,
            /fetch\(['"]([^'"]+)['"]\)/gi,
            /axios\.[get|post]+\(['"]([^'"]+)['"]\)/gi,
            /\/search/gi,
            /\/scheme/gi,
            /endpoint/gi
        ];

        scripts.forEach((script, index) => {
            if (script) {
                apiPatterns.forEach(pattern => {
                    const matches = script.match(pattern);
                    if (matches && matches.length > 0) {
                        console.log(`  Found in script ${index}:`, [...new Set(matches)].slice(0, 5));
                    }
                });
            }
        });

        // Look for data attributes
        console.log('\n📊 Looking for data attributes...');
        $('[data-scheme], [data-id], [data-url]').each((i, el) => {
            if (i < 5) { // Show first 5
                const attrs = el.attribs;
                console.log(`  Element ${i + 1}:`, Object.keys(attrs).filter(k => k.startsWith('data-')));
            }
        });

        // Look for forms
        console.log('\n📝 Analyzing forms...');
        $('form').each((i, el) => {
            const action = $(el).attr('action');
            const method = $(el).attr('method');
            console.log(`  Form ${i + 1}:`);
            console.log(`    Action: ${action || 'N/A'}`);
            console.log(`    Method: ${method || 'GET'}`);

            // Show inputs
            $(el).find('input, select').each((j, input) => {
                const name = $(input).attr('name');
                const type = $(input).attr('type');
                if (name) {
                    console.log(`    Input: ${name} (${type || 'text'})`);
                }
            });
        });

        // Look for links to scheme details
        console.log('\n🔗 Analyzing scheme links...');
        const schemeLinks = $('a[href*="scheme"], a[href*="detail"]');
        console.log(`  Found ${schemeLinks.length} potential scheme links`);
        schemeLinks.slice(0, 5).each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim().substring(0, 50);
            console.log(`  ${i + 1}. ${text} -> ${href}`);
        });

        // Check for JSON-LD structured data
        console.log('\n🏷️  Looking for structured data...');
        $('script[type="application/ld+json"]').each((i, el) => {
            try {
                const data = JSON.parse($(el).html());
                console.log(`  Found JSON-LD ${i + 1}:`, Object.keys(data));
                fs.writeFileSync(`results/myscheme-jsonld-${i}.json`, JSON.stringify(data, null, 2));
            } catch (e) {
                // Not valid JSON
            }
        });

        // Look for meta tags
        console.log('\n🏷️  Meta tags...');
        $('meta[property], meta[name]').each((i, el) => {
            const property = $(el).attr('property') || $(el).attr('name');
            const content = $(el).attr('content');
            if (property && (property.includes('api') || property.includes('endpoint'))) {
                console.log(`  ${property}: ${content}`);
            }
        });

        console.log('\n\n✅ Analysis complete!');
        console.log('📁 Check results/myscheme-search.html for the full page');
        console.log('\n💡 Next steps:');
        console.log('   1. Open results/myscheme-search.html in a browser');
        console.log('   2. Use DevTools to inspect the page');
        console.log('   3. Check Network tab for API calls');
        console.log('   4. Look for AJAX requests when searching');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
        }
    }
}

// Also test if there's an API endpoint
async function testPossibleAPIs() {
    console.log('\n\n' + '='.repeat(70));
    console.log('🧪 Testing Possible API Endpoints');
    console.log('='.repeat(70));

    const possibleEndpoints = [
        'https://www.myscheme.gov.in/api/scheme',
        'https://www.myscheme.gov.in/api/schemes',
        'https://www.myscheme.gov.in/api/search',
        'https://www.myscheme.gov.in/search/api',
        'https://api.myscheme.gov.in/schemes',
        'https://www.myscheme.gov.in/scheme/list',
        'https://www.myscheme.gov.in/schemes/all'
    ];

    for (const endpoint of possibleEndpoints) {
        try {
            console.log(`\n🔍 Testing: ${endpoint}`);
            const response = await axios.get(endpoint, {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json'
                }
            });

            console.log(`   ✅ Success! Status: ${response.status}`);
            console.log(`   Content-Type: ${response.headers['content-type']}`);

            if (typeof response.data === 'object') {
                console.log(`   📊 JSON Response!`);
                fs.writeFileSync(
                    `results/api-${endpoint.split('/').pop()}.json`,
                    JSON.stringify(response.data, null, 2)
                );
            }

        } catch (error) {
            if (error.response) {
                console.log(`   ❌ ${error.response.status} - ${error.response.statusText}`);
            } else {
                console.log(`   ❌ ${error.message}`);
            }
        }

        // Be respectful - wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Run all tests
async function main() {
    await analyzeMyScheme();
    await testPossibleAPIs();

    console.log('\n\n' + '='.repeat(70));
    console.log('✅ ALL TESTS COMPLETE');
    console.log('='.repeat(70));
    console.log('\n📁 Results saved in results/ directory');
    console.log('🌐 Open results/myscheme-search.html in browser to inspect');
}

main().catch(console.error);
