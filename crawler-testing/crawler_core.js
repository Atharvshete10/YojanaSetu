/**
 * crawler_core.js
 * Node.js script to handle API requests for the Python crawler.
 * Usage: node crawler_core.js <command> [args...]
 */

const axios = require('axios');

const API_BASE = 'https://api.myscheme.gov.in/schemes/v6/public/schemes';
const SEARCH_BASE = 'https://api.myscheme.gov.in/schemes/v6/public/search';
const API_KEY = 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc';

const headers = {
    'x-api-key': API_KEY,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://www.myscheme.gov.in',
    'Referer': 'https://www.myscheme.gov.in/',
    'Content-Type': 'application/json'
};

async function postSearch(page = 1, size = 20) {
    try {
        const payload = {
            "text": "",
            "tags": [],
            "states": [],
            "ministeries": [],
            "categories": [],
            "page": page,
            "size": size,
            "sort": "recent",
            "lang": "en"
        };

        const response = await axios.post(SEARCH_BASE, payload, { headers, timeout: 15000 });
        console.log(JSON.stringify({ status: 'success', data: response.data }));
    } catch (error) {
        console.log(JSON.stringify({
            status: 'error',
            message: error.message,
            statusCode: error.response?.status,
            data: error.response?.data
        }));
    }
}

async function getScheme(slug) {
    for (let i = 1; i <= 5; i++) {
        try {
            const url = `${API_BASE}?slug=${slug}&lang=en`;
            const response = await axios.get(url, { headers, timeout: 15000 });
            console.log(JSON.stringify({ status: 'success', data: response.data }));
            return;
        } catch (error) {
            if (i === 5) {
                console.log(JSON.stringify({
                    status: 'error',
                    message: error.message,
                    statusCode: error.response?.status,
                    data: error.response?.data
                }));
            } else {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, i * 2000));
            }
        }
    }
}

async function main() {
    const [, , command, ...args] = process.argv;

    if (command === 'list') {
        const page = parseInt(args[0]) || 1;
        const size = parseInt(args[1]) || 20;
        await postSearch(page, size);
    } else if (command === 'scheme') {
        const slug = args[0];
        if (!slug) {
            console.error(JSON.stringify({ status: 'error', message: 'Slug required' }));
            return;
        }
        await getScheme(slug);
    } else if (command === 'fetch') {
        const url = args[0];
        if (!url) {
            console.error(JSON.stringify({ status: 'error', message: 'URL required' }));
            return;
        }
        try {
            const response = await axios.get(url, { headers, timeout: 15000 });
            console.log(response.data); // Print raw data for XML
        } catch (error) {
            console.error(JSON.stringify({
                status: 'error',
                message: error.message,
                statusCode: error.response?.status
            }));
        }
    } else {
        console.error(JSON.stringify({ status: 'error', message: 'Unknown command' }));
    }
}

main();
