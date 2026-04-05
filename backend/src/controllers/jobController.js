const Job = require('../models/jobModel');

const getAllJobs = async (req, res) => {
    try {
        const { state, search, sort } = req.query;
        const jobs = await Job.getAll({ state, search, sort });
        res.json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getAllJobs
};
