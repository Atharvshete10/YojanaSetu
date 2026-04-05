const { query } = require('../config/database');

const Scheme = {
    getAll: async (filters = {}) => {
        let sql = 'SELECT * FROM schemes WHERE 1=1';
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
            title, description, eligibility, benefits, 
            state, category, launch_date, deadline, 
            official_link, source 
        } = data;
        
        const sql = `
            INSERT OR IGNORE INTO schemes 
            (title, description, eligibility, benefits, state, category, launch_date, deadline, official_link, source) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(sql, [
            title, description, eligibility, benefits, 
            state, category, launch_date, deadline, 
            official_link, source
        ]);
        return result.lastID;
    },

    bulkCreate: async (schemes) => {
        for (const scheme of schemes) {
            try {
                await Scheme.create(scheme);
            } catch (err) {
                console.error('Error in Scheme.create:', err.message);
            }
        }
    }
};

module.exports = Scheme;
