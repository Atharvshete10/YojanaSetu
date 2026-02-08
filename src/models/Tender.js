import { getDb } from '../database/db.js';

class TenderModel {
    static async getAll({ state, search, department, type, sort, limit = 10, offset = 0 }) {
        const db = await getDb();
        let query = 'SELECT * FROM tenders WHERE 1=1';
        const params = [];

        if (state) {
            query += ' AND state = ?';
            params.push(state);
        }

        if (search) {
            query += ' AND tender_name LIKE ?';
            params.push(`%${search}%`);
        }

        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }

        if (type) {
            query += ' AND tender_type = ?';
            params.push(type);
        }

        if (sort === 'opening') {
            query += ' ORDER BY published_date DESC';
        } else if (sort === 'closing') {
            query += ' ORDER BY closing_date ASC';
        } else if (sort === 'a-z') {
            query += ' ORDER BY tender_name ASC';
        } else {
            query += ' ORDER BY created_at DESC';
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const rows = await db.all(query, params);

        let countQuery = 'SELECT COUNT(*) as total FROM tenders WHERE 1=1';
        const countParams = [];
        if (state) { countQuery += ' AND state = ?'; countParams.push(state); }
        if (search) { countQuery += ' AND tender_name LIKE ?'; countParams.push(`%${search}%`); }
        if (department) { countQuery += ' AND department = ?'; countParams.push(department); }
        if (type) { countQuery += ' AND tender_type = ?'; countParams.push(type); }

        const total = await db.get(countQuery, countParams);

        return { data: rows, total: total.total };
    }

    static async getById(id) {
        const db = await getDb();
        return await db.get('SELECT * FROM tenders WHERE id = ?', [id]);
    }
}

export default TenderModel;
