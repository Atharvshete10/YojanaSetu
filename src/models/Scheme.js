import { getDb } from '../database/db.js';

class SchemeModel {
    static async getAll({ state, search, sort, limit = 10, offset = 0 }) {
        const db = await getDb();
        let query = 'SELECT * FROM schemes WHERE 1=1';
        const params = [];

        if (state) {
            query += ' AND state = ?';
            params.push(state);
        }

        if (search) {
            query += ' AND title LIKE ?';
            params.push(`%${search}%`);
        }

        if (sort === 'a-z') {
            query += ' ORDER BY title ASC';
        } else if (sort === 'z-a') {
            query += ' ORDER BY title DESC';
        } else if (sort === 'deadline') {
            query += ' ORDER BY end_date ASC';
        } else {
            query += ' ORDER BY created_at DESC';
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const rows = await db.all(query, params);
        const countQuery = 'SELECT COUNT(*) as total FROM schemes WHERE 1=1' + (state ? ' AND state = ?' : '') + (search ? ' AND title LIKE ?' : '');
        const countParams = [];
        if (state) countParams.push(state);
        if (search) countParams.push(`%${search}%`);
        const total = await db.get(countQuery, countParams);

        return { data: rows, total: total.total };
    }

    static async getById(id) {
        const db = await getDb();
        return await db.get('SELECT * FROM schemes WHERE id = ?', [id]);
    }
}

export default SchemeModel;
