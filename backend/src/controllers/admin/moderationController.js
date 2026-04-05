const CrawlResultModel = require('../../models/CrawlResult');
const SchemeModel = require('../../models/schemeModel'); // Fixed name
const TenderModel = require('../../models/tenderModel'); // Fixed name
const JobModel = require('../../models/jobModel');       // Fixed name
const { query, transaction } = require('../../config/database');
const logger = require('../../services/logger');

// Get all pending crawl results
exports.getPending = async (req, res, next) => {
    try {
        const { type, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const result = await CrawlResultModel.getPending({
            type,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: result.data,
            pagination: {
                total: result.total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(result.total / limit)
            }
        });

    } catch (error) {
        console.error('Error in getPending:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single crawl result by ID
exports.getById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await CrawlResultModel.getById(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Crawl result not found'
            });
        }

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error in getById:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Approve crawl result (move to public table)
exports.approve = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get crawl result
        const crawlResult = await CrawlResultModel.getById(id);

        if (!crawlResult) {
            return res.status(404).json({
                success: false,
                message: 'Crawl result not found'
            });
        }

        // Use transaction to ensure atomicity
        await transaction(async (client) => {
            // Delete from pending/crawl_results
            await client.query('DELETE FROM crawl_results WHERE id = $1', [id]);

            // Insert into appropriate public table
            const data = crawlResult.normalized_data;

            switch (crawlResult.type) {
                case 'scheme':
                    await SchemeModel.create(data);
                    break;
                case 'tender':
                    await TenderModel.create(data); // Note: Model create method might differ
                    break;
                case 'recruitment':
                case 'job':
                    await JobModel.create(data);
                    break;
            }

            // Log action if table exists
            try {
                await client.query(
                    `INSERT INTO audit_logs (action, entity_type, entity_id) VALUES ($1, $2, $3)`,
                    ['approve', crawlResult.type, id]
                );
            } catch (e) { /* ignore if log fails */ }
        });

        logger.info(`Crawl result ${id} approved`);

        res.json({
            success: true,
            message: 'Crawl result approved and published successfully'
        });

    } catch (error) {
        console.error('Error in approve:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reject crawl result
exports.reject = async (req, res, next) => {
    try {
        const { id } = req.params;
        await CrawlResultModel.reject(id);
        res.json({
            success: true,
            message: 'Crawl result rejected successfully'
        });
    } catch (error) {
        console.error('Error in reject:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
