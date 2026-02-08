import { getDb } from '../database/db.js';

class RecruitmentModel {
    static async getAll({ state, search, qualification, department, sort, limit = 10, offset = 0 }) {
        const db = await getDb();
        let query = 'SELECT * FROM recruitments WHERE 1=1';
        const params = [];

        if (state) {
            query += ' AND state = ?';
            params.push(state);
        }

        if (search) {
            query += ' AND post_name LIKE ?';
            params.push(`%${search}%`);
        }

        if (qualification) {
            query += ' AND qualification LIKE ?';
            params.push(`%${qualification}%`);
        }

        if (department) {
            query += ' AND organization LIKE ?';
            params.push(`%${department}%`);
        }

        if (sort === 'deadline') {
            query += ' ORDER BY application_end_date ASC';
        } else if (sort === 'a-z') {
            query += ' ORDER BY post_name ASC';
        } else {
            query += ' ORDER BY created_at DESC';
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const rows = await db.all(query, params);

        let countQuery = 'SELECT COUNT(*) as total FROM recruitments WHERE 1=1';
        const countParams = [];
        if (state) { countQuery += ' AND state = ?'; countParams.push(state); }
        if (search) { countQuery += ' AND post_name LIKE ?'; countParams.push(`%${search}%`); }
        if (qualification) { countQuery += ' AND qualification LIKE ?'; countParams.push(`%${qualification}%`); }
        if (department) { countQuery += ' AND organization LIKE ?'; countParams.push(`%${department}%`); }

        const total = await db.get(countQuery, countParams);

        return { data: rows, total: total.total };
    }

    static async getById(id) {
        const db = await getDb();
        return await db.get('SELECT * FROM recruitments WHERE id = ?', [id]);
    }
}

export default RecruitmentModel;
