const scheduler = require('../../services/scheduler');
const { query } = require('../../config/database');
const logger = require('../../services/logger');

// Get all sources
exports.getSources = async (req, res, next) => {
    try {
        const result = await query(
            'SELECT * FROM sources ORDER BY type, name'
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        next(error);
    }
};

// Manually trigger crawler for a specific source
exports.triggerCrawler = async (req, res, next) => {
    try {
        const { sourceId } = req.body;

        if (!sourceId) {
            return res.status(400).json({
                success: false,
                message: 'sourceId is required'
            });
        }

        // Trigger crawler
        const result = await scheduler.triggerCrawler(sourceId);

        // Log action
        await query(
            `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
            [req.admin.id, 'trigger_crawler', 'source', sourceId]
        );

        logger.info(`Crawler triggered for source ${sourceId} by ${req.admin.email}`);

        res.json({
            success: true,
            message: result.message
        });

    } catch (error) {
        next(error);
    }
};

// Get crawl jobs history
exports.getCrawlJobs = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, sourceId } = req.query;
        const offset = (page - 1) * limit;

        let queryText = `
      SELECT cj.*, s.name as source_name, s.type as source_type
      FROM crawl_jobs cj
      LEFT JOIN sources s ON cj.source_id = s.id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 0;

        if (status) {
            paramCount++;
            queryText += ` AND cj.status = $${paramCount}`;
            params.push(status);
        }

        if (sourceId) {
            paramCount++;
            queryText += ` AND cj.source_id = $${paramCount}`;
            params.push(sourceId);
        }

        queryText += ' ORDER BY cj.created_at DESC';

        paramCount++;
        queryText += ` LIMIT $${paramCount}`;
        params.push(limit);

        paramCount++;
        queryText += ` OFFSET $${paramCount}`;
        params.push(offset);

        const result = await query(queryText, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM crawl_jobs WHERE 1=1';
        const countParams = [];
        let countParamCount = 0;

        if (status) {
            countParamCount++;
            countQuery += ` AND status = $${countParamCount}`;
            countParams.push(status);
        }

        if (sourceId) {
            countParamCount++;
            countQuery += ` AND source_id = $${countParamCount}`;
            countParams.push(sourceId);
        }

        const countResult = await query(countQuery, countParams);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].total),
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(countResult.rows[0].total / limit)
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get crawl job details
exports.getCrawlJobById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT cj.*, s.name as source_name, s.type as source_type, s.url as source_url
       FROM crawl_jobs cj
       LEFT JOIN sources s ON cj.source_id = s.id
       WHERE cj.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Crawl job not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};

// ============================================
// Enhanced MyScheme Crawler Control
// ============================================

const SchemesCrawler = require('../../services/crawlers/schemesCrawler');
const { Pool } = require('pg');

// Global crawler instance (singleton pattern)
let mySchemeCrawlerInstance = null;

/**
 * Start MyScheme crawler
 * POST /api/admin/crawler/myscheme/start
 */
exports.startMySchemeCrawler = async (req, res, next) => {
    try {
        const { batch_size = 50 } = req.body;

        // Validate batch size
        if (batch_size < 10 || batch_size > 100) {
            return res.status(400).json({
                success: false,
                message: 'Batch size must be between 10 and 100'
            });
        }

        // Check if crawler is already running
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        const statusCheck = await pool.query(
            'SELECT is_running, current_job_id FROM crawler_status WHERE id = 1'
        );

        if (statusCheck.rows[0]?.is_running) {
            await pool.end();
            return res.status(409).json({
                success: false,
                message: 'Crawler is already running',
                job_id: statusCheck.rows[0].current_job_id
            });
        }

        await pool.end();

        // Create new crawler instance
        mySchemeCrawlerInstance = new SchemesCrawler();
        mySchemeCrawlerInstance.batchSize = batch_size;

        // Start crawler in background
        mySchemeCrawlerInstance.crawl().catch(error => {
            logger.error('MyScheme crawler error:', error);
        });

        // Wait for job to be created
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get the job ID
        const pool2 = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        const jobResult = await pool2.query(
            'SELECT current_job_id FROM crawler_status WHERE id = 1'
        );

        await pool2.end();

        // Log action
        await query(
            `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id)
             VALUES ($1, $2, $3, $4)`,
            [req.admin.id, 'start_myscheme_crawler', 'crawler_job', jobResult.rows[0]?.current_job_id]
        );

        logger.info(`MyScheme crawler started by ${req.admin.email} with batch size ${batch_size}`);

        res.json({
            success: true,
            message: 'MyScheme crawler started successfully',
            job_id: jobResult.rows[0]?.current_job_id,
            batch_size
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Pause MyScheme crawler
 * POST /api/admin/crawler/myscheme/pause
 */
exports.pauseMySchemeCrawler = async (req, res, next) => {
    try {
        if (!mySchemeCrawlerInstance) {
            return res.status(400).json({
                success: false,
                message: 'No MyScheme crawler instance is running'
            });
        }

        mySchemeCrawlerInstance.pause();

        // Update job status
        await query(`
            UPDATE crawler_jobs
            SET status = 'paused', last_updated = NOW()
            WHERE id = (SELECT current_job_id FROM crawler_status WHERE id = 1)
        `);

        logger.info(`MyScheme crawler paused by ${req.admin.email}`);

        res.json({
            success: true,
            message: 'MyScheme crawler paused successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Stop MyScheme crawler
 * POST /api/admin/crawler/myscheme/stop
 */
exports.stopMySchemeCrawler = async (req, res, next) => {
    try {
        if (!mySchemeCrawlerInstance) {
            return res.status(400).json({
                success: false,
                message: 'No MyScheme crawler instance is running'
            });
        }

        mySchemeCrawlerInstance.stop();

        // Update job status
        await query(`
            UPDATE crawler_jobs
            SET status = 'stopped', completed_at = NOW(), last_updated = NOW()
            WHERE id = (SELECT current_job_id FROM crawler_status WHERE id = 1)
        `);

        // Clear crawler instance
        mySchemeCrawlerInstance = null;

        logger.info(`MyScheme crawler stopped by ${req.admin.email}`);

        res.json({
            success: true,
            message: 'MyScheme crawler stopped successfully'
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get MyScheme crawler status
 * GET /api/admin/crawler/myscheme/status
 */
exports.getMySchemeCrawlerStatus = async (req, res, next) => {
    try {
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });

        // Get global status
        const statusResult = await pool.query(`
            SELECT * FROM crawler_status WHERE id = 1
        `);

        const status = statusResult.rows[0];

        // Get current job details if running
        let currentJob = null;
        if (status.is_running && status.current_job_id) {
            const jobResult = await pool.query(`
                SELECT * FROM crawler_jobs WHERE id = $1
            `, [status.current_job_id]);

            currentJob = jobResult.rows[0];
        }

        await pool.end();

        res.json({
            success: true,
            status: {
                is_running: status.is_running,
                last_run_at: status.last_run_at,
                last_success_at: status.last_success_at,
                last_error: status.last_error,
                total_runs: status.total_runs,
                total_success: status.total_success,
                total_failures: status.total_failures
            },
            current_job: currentJob ? {
                id: currentJob.id,
                status: currentJob.status,
                batch_size: currentJob.batch_size,
                current_batch: currentJob.current_batch,
                total_fetched: currentJob.total_fetched,
                progress_percentage: currentJob.progress_percentage,
                success_count: currentJob.success_count,
                failed_count: currentJob.failed_count,
                duplicate_count: currentJob.duplicate_count,
                started_at: currentJob.started_at,
                last_updated: currentJob.last_updated
            } : null
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get MyScheme crawler jobs
 * GET /api/admin/crawler/myscheme/jobs
 */
exports.getMySchemeJobs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        let queryText = `SELECT * FROM crawler_jobs WHERE job_type = 'schemes'`;
        const params = [];
        let paramCount = 0;

        if (status) {
            paramCount++;
            queryText += ` AND status = $${paramCount}`;
            params.push(status);
        }

        queryText += ' ORDER BY started_at DESC';

        paramCount++;
        queryText += ` LIMIT $${paramCount}`;
        params.push(parseInt(limit));

        paramCount++;
        queryText += ` OFFSET $${paramCount}`;
        params.push(offset);

        const result = await query(queryText, params);

        // Get total count
        let countQuery = `SELECT COUNT(*) as total FROM crawler_jobs WHERE job_type = 'schemes'`;
        const countParams = [];

        if (status) {
            countQuery += ` AND status = $1`;
            countParams.push(status);
        }

        const countResult = await query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        next(error);
    }
};

