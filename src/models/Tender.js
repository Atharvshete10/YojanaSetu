const { query } = require('../config/database');

class TenderModel {
    static async getAll({ state, search, sort, limit = 10, offset = 0 }) {
        let queryText = `
      SELECT * FROM tenders 
      WHERE status = 'approved'
    `;
        const params = [];
        let paramCount = 0;

        if (state) {
            paramCount++;
            queryText += ` AND state = $${paramCount}`;
            params.push(state);
        }

        if (search) {
            paramCount++;
            queryText += ` AND (tender_name LIKE $${paramCount} OR description LIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        if (sort === 'a-z') {
            queryText += ' ORDER BY tender_name ASC';
        } else if (sort === 'z-a') {
            queryText += ' ORDER BY tender_name DESC';
        } else if (sort === 'deadline') {
            queryText += ' ORDER BY closing_date ASC';
        } else {
            queryText += ' ORDER BY created_at DESC';
        }

        paramCount++;
        queryText += ` LIMIT $${paramCount}`;
        params.push(limit);

        paramCount++;
        queryText += ` OFFSET $${paramCount}`;
        params.push(offset);

        const result = await query(queryText, params);

        let countQuery = `SELECT COUNT(*) as total FROM tenders WHERE status = 'approved'`;
        const countParams = [];
        let countParamCount = 0;

        if (state) {
            countParamCount++;
            countQuery += ` AND state = $${countParamCount}`;
            countParams.push(state);
        }

        if (search) {
            countParamCount++;
            countQuery += ` AND (tender_name LIKE $${countParamCount} OR description LIKE $${countParamCount})`;
            countParams.push(`%${search}%`);
        }

        const countResult = await query(countQuery, countParams);

        return {
            data: result.rows,
            total: parseInt(countResult.rows[0].total)
        };
    }

    static async getById(id) {
        const result = await query(
            'SELECT * FROM tenders WHERE id = $1 AND status = $2',
            [id, 'approved']
        );
        return result.rows[0];
    }

    static async create(data, adminId) {
        const result = await query(
            `INSERT INTO tenders (
        tender_name, tender_id, reference_number, state, department, ministry,
        tender_type, published_date, opening_date, closing_date, description,
        documents_required, fee_details, source_url, source_website,
        status, approved_by, approved_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
                data.tender_name, data.tender_id, data.reference_number, data.state,
                data.department, data.ministry, data.tender_type, data.published_date,
                data.opening_date, data.closing_date, data.description,
                data.documents_required, data.fee_details, data.source_url,
                data.source_website, 'approved', adminId
            ]
        );

        if (result.lastID) {
            return await this.getById(result.lastID);
        }
        return null;
    }

    static async update(id, data) {
        await query(
            `UPDATE tenders SET
        tender_name = COALESCE($1, tender_name),
        description = COALESCE($2, description),
        state = COALESCE($3, state),
        department = COALESCE($4, department),
        ministry = COALESCE($5, ministry),
        tender_type = COALESCE($6, tender_type),
        closing_date = COALESCE($7, closing_date),
        last_updated = CURRENT_TIMESTAMP
      WHERE id = $8`,
            [
                data.tender_name, data.description, data.state, data.department,
                data.ministry, data.tender_type, data.closing_date, id
            ]
        );
        return await this.getById(id);
    }

    static async delete(id) {
        await query('DELETE FROM tenders WHERE id = $1', [id]);
    }
}

module.exports = TenderModel;
