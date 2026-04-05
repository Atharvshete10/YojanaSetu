const { query } = require('../config/database');

const Job = {
    getAll: async (filters = {}) => {
        let sql = 'SELECT * FROM jobs WHERE 1=1';
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
            title, department, state, qualification, 
            salary, deadline, apply_link, source 
        } = data;
        
        const sql = `
            INSERT OR IGNORE INTO jobs 
            (title, department, state, qualification, salary, deadline, apply_link, source) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(sql, [
            title, department, state, qualification, 
            salary, deadline, apply_link, source
        ]);
        return result.lastID;
    },

    bulkCreate: async (jobs) => {
        for (const job of jobs) {
            try {
                await Job.create(job);
            } catch (err) {
                console.error('Error in Job.create:', err.message);
            }
        }
    }
};

module.exports = Job;
