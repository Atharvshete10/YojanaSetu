const RecruitmentModel = require('../models/Recruitment');

exports.getRecruitments = async (req, res) => {
    try {
        const { state, search, qualification, location, department, organization, sort, page = 1, limit = 20 } = req.query;
        const parsedLimit = Math.min(parseInt(limit) || 20, 50);
        const offset = (parseInt(page) - 1) * parsedLimit;

        const result = await RecruitmentModel.getAll({
            state,
            search,
            qualification,
            location,
            department,
            organization,
            sort,
            limit: parsedLimit,
            offset
        });

        res.json({
            success: true,
            data: result.data,
            page: parseInt(page),
            limit: parsedLimit,
            total: result.total,
            pagination: {
                total: result.total,
                page: parseInt(page),
                limit: parsedLimit,
                totalPages: Math.ceil(result.total / parsedLimit)
            }
        });
    } catch (error) {
        console.error('getRecruitments error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRecruitmentById = async (req, res) => {
    try {
        const recruitment = await RecruitmentModel.getById(req.params.id);
        if (!recruitment) return res.status(404).json({ success: false, message: 'Recruitment not found' });
        res.json({ success: true, data: recruitment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/recruitments/filters — for populating filter dropdowns
exports.getRecruitmentFilters = async (req, res) => {
    try {
        const [organizations, qualifications] = await Promise.all([
            RecruitmentModel.getDistinctOrganizations(),
            RecruitmentModel.getDistinctQualifications()
        ]);
        res.json({
            success: true,
            filters: {
                organizations,
                qualifications
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
