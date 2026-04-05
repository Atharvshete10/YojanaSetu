const { query } = require('../config/database');

const StatModel = {
    getStats: async () => {
        try {
            const schemesRes = await query('SELECT COUNT(*) as count FROM schemes');
            const tendersRes = await query('SELECT COUNT(*) as count FROM tenders');
            const jobsRes = await query('SELECT COUNT(*) as count FROM jobs');

            return {
                totalSchemes: schemesRes.rows[0]?.count || 0,
                totalTenders: tendersRes.rows[0]?.count || 0,
                totalJobs: jobsRes.rows[0]?.count || 0
            };
        } catch (error) {
            console.error('Error in getStats model:', error);
            throw error;
        }
    }
};

module.exports = StatModel;
