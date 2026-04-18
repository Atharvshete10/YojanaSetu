const db = require('./src/config/database');
(async () => {
  try {
    await db.query(`UPDATE tenders SET extended_details = '{"Notice": "This tender was crawled before the extended details feature was introduced. Please run the crawler again to dynamically fetch the full table."}' WHERE extended_details IS NULL;`);
    console.log('Database patched successfully.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
