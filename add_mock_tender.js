const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.run(
    `INSERT INTO tenders (
        tender_name, tender_id, reference_number, state, department, ministry, tender_type, 
        published_date, opening_date, closing_date, description,
        fee_details, source_url, source_website, status, created_at, last_updated
    ) VALUES (
        'Bridge Construction Phase 4', 'TEND-1234', 'REF-99', 'Maharashtra', 'PWD', 'MoRTH', 'Open Tender',
        '2026-03-01', '2026-03-05', '2026-05-10', 'Construction of a local highway bridge.',
        'None', 'https://example.com/tender', 'eprocure.gov.in', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )`,
    (err) => {
        if (err) console.error(err);
        else console.log('Mock tender successfully inserted into database!');
        db.close();
    }
);
