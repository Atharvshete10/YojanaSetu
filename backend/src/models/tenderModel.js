const { query } = require('../config/database');

const Tender = {
    getAll: async (filters = {}) => {
        let sql = 'SELECT * FROM tenders WHERE 1=1';
        const params = [];

        if (filters.state) {
            sql += ' AND state = ?';
            params.push(filters.state);
        }

        if (filters.search) {
            sql += ' AND title LIKE ?';
            params.push(`%${filters.search}%`);
        }

        if (filters.sort === 'deadline') {
            sql += ' ORDER BY deadline ASC';
        } else if (filters.sort === 'alphabetical') {
            sql += ' ORDER BY title ASC';
        } else {
            sql += ' ORDER BY id DESC';
        }

        const result = await query(sql, params);
        return result.rows;
    },

    create: async (data) => {
        const { 
            title, department, state, location, 
            budget, publish_date, deadline, 
            official_link, source 
        } = data;
        
        const sql = `
            INSERT OR IGNORE INTO tenders 
            (title, department, state, location, budget, publish_date, deadline, official_link, source) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(sql, [
            title, department, state, location, 
            budget, publish_date, deadline, 
            official_link, source
        ]);
        return result.lastID;
    },

    bulkCreate: async (tenders) => {
        for (const tender of tenders) {
            try {
                await Tender.create(tender);
            } catch (err) {
                console.error('Error in Tender.create:', err.message);
            }
        }
    }
};

module.exports = Tender;
