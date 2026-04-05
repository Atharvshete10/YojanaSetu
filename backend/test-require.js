try {
    console.log('Testing schemeRoutes...');
    const schemeRoutes = require('./src/routes/schemeRoutes');
    console.log('✓ schemeRoutes loaded');

    console.log('Testing tenderRoutes...');
    const tenderRoutes = require('./src/routes/tenderRoutes');
    console.log('✓ tenderRoutes loaded');

    console.log('Testing jobRoutes...');
    const jobRoutes = require('./src/routes/jobRoutes');
    console.log('✓ jobRoutes loaded');

    console.log('Testing adminRoutes...');
    const adminRoutes = require('./src/routes/adminRoutes');
    console.log('✓ adminRoutes loaded');

    console.log('All routes loaded successfully!');
} catch (err) {
    console.error('FAILED TO LOAD MODULE:');
    console.error(err);
}
