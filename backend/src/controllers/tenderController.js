const Tender = require('../models/tenderModel');

const getAllTenders = async (req, res) => {
    try {
        const { state, search, sort } = req.query;
        const tenders = await Tender.getAll({ state, search, sort });
        res.json({ success: true, count: tenders.length, data: tenders });
    } catch (error) {
        console.error('Error fetching tenders:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getAllTenders
};
