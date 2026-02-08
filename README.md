# Unified Government Information Portal

A comprehensive platform to track government schemes, tenders, and recruitments across India.

## Features
- **Real-time Dashboard**: Overview of all available opportunities.
- **Automated Data Pipeline**: Crawlers for MyScheme, MajhiNaukri, and eProcure.
- **Smart Search & Filter**: Find opportunities by state, category, or keyword.
- **Deduplication**: Intelligent storage to prevent duplicate entries.
- **Responsive UI**: optimized for both desktop and mobile.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Automation**: node-cron, axios, cheerio
- **Frontend**: Vanilla JS, HTML5, CSS3

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

## Automated Data Pipeline
The portal includes a built-in crawler system that runs every 24 hours (configurable in `src/services/scheduler.js`).
- **Jobs**:
  - Schemes: Fetched from myScheme.gov.in (API)
  - Tenders: Scraped from eProcure.gov.in
  - Recruitments: Scraped from MajhiNaukri.in

## Deployment (Render)
1. Link your GitHub repository to Render.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Add Environment Variables (optional):
   - `PORT`: Default is 3000
   - `NODE_ENV`: production

## Folder Structure
```
src/
├── controllers/    # API logic
├── database/       # DB connection & schema
├── models/         # Data models (UPSERT logic)
├── routes/         # API routes
├── services/       # Scheduler & Crawlers
└── public/         # Frontend assets
```
