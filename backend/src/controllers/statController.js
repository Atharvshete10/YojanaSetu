const StatModel = require('../models/statModel');

const getStats = async (req, res) => {
    try {
        const stats = await StatModel.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getStats
};
