require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');

// Import config and middleware
const config = require(path.join(__dirname, 'config/env'));
const { errorHandler, notFound } = require(path.join(__dirname, 'middleware/errorHandler'));
const logger = require(path.join(__dirname, 'services/logger'));
const initScheduler = require(path.join(__dirname, 'services/scheduler'));

// Import routes
const schemeRoutes = require(path.join(__dirname, 'routes/schemeRoutes'));
const tenderRoutes = require(path.join(__dirname, 'routes/tenderRoutes'));
const jobRoutes = require(path.join(__dirname, 'routes/jobRoutes'));
const adminRoutes = require(path.join(__dirname, 'routes/adminRoutes'));

const { runAllScrapers } = require(path.join(__dirname, 'services/scraperService'));

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// API ROUTES
// ============================================

app.use('/api/schemes', schemeRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);

// Public Stats
const { getStats } = require(path.join(__dirname, 'controllers/statController'));
app.get('/api/stats', getStats);


// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

app.listen(PORT, async () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    
    // Initialize automated jobs
    if (process.env.TRIGGER_CRAWL_ON_START === 'true') {
        runAllScrapers();
    }
});

const gracefulShutdown = () => {
    logger.info('Shutting down gracefully');
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
