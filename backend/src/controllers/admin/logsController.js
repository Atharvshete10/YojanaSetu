const { query } = require('../../config/database');

// Get audit logs
const getLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const result = await query(
            `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
            [parseInt(limit), parseInt(offset)]
        );

        const countResult = await query('SELECT COUNT(*) as total FROM audit_logs');

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: countResult.rows[0].total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getLogs
};
