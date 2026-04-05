const Scheme = require('../models/schemeModel');

const getAllSchemes = async (req, res) => {
    try {
        const { state, search, sort } = req.query;
        const schemes = await Scheme.getAll({ state, search, sort });
        res.json({ success: true, count: schemes.length, data: schemes });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getAllSchemes
};
