# Automated Scheme Crawler Guide

You asked "how to automate this". I have built a fully automated pipeline that **discovers** new schemes using a headless browser (Puppeteer) and then **extracts** their details using the hybrid crawler.

## The Problem with Traditional Crawling
Simple scripts are blocked by the government server's strict security (WAF). To bypass this, we must use a real browser engine to "browse" the site like a human.

## The Solution: 2-Step Automation

I have created `automated_crawler.py` which runs two steps:

1.  **Discovery (Node.js + Puppeteer)**:
    -   Script: `discover_slugs.js`
    -   Action: Launches a hidden Chrome browser, goes to `myscheme.gov.in/search`, scrolls down to load schemes, and saves their IDs to `slugs.txt`.
    -   **Benefit**: Always gets the latest list of schemes automatically.

2.  **Extraction (Python + Node.js)**:
    -   Script: `crawler.py`
    -   Action: Reads `slugs.txt` and fetches details for every scheme.
    -   **Benefit**: Robustly handles network errors and saves consistent JSON data.

## How to Run

Simply run this single command:

```bash
python automated_crawler.py
```

### What Happens
1.  It installs/launches Puppeteer.
2.  It finds schemes and updates `slugs.txt`.
3.  It fetches details for all schemes into `results/`.
4.  It saves a consolidated `results/all_schemes.json`.

## Scheduling (True Automation)
To run this daily without you touching it:
-   **Windows**: Use Task Scheduler to run `python d:\CEP PROJECT\govSchemes\crawler-testing\automated_crawler.py` every day at a specific time.
-   **Linux/Mac**: Add a cron job: `0 0 * * * python /path/to/automated_crawler.py`.

## Requirements
-   Node.js installed (`npm install puppeteer` - I've already run this).
-   Python installed.
