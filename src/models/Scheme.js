const { query } = require('../config/database');

class SchemeModel {
    // Get all approved schemes with filters
    static async getAll({ state, search, sort, limit = 10, offset = 0 }) {
        let queryText = `
      SELECT * FROM schemes 
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
            queryText += ` AND (title LIKE $${paramCount} OR description LIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        // Sorting
        if (sort === 'a-z') {
            queryText += ' ORDER BY title ASC';
        } else if (sort === 'z-a') {
            queryText += ' ORDER BY title DESC';
        } else if (sort === 'deadline') {
            queryText += ' ORDER BY end_date ASC';
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

        // Get total count
        let countQuery = `SELECT COUNT(*) as total FROM schemes WHERE status = 'approved'`;
        const countParams = [];
        let countParamCount = 0;

        if (state) {
            countParamCount++;
            countQuery += ` AND state = $${countParamCount}`;
            countParams.push(state);
        }

        if (search) {
            countParamCount++;
            countQuery += ` AND (title LIKE $${countParamCount} OR description LIKE $${countParamCount})`;
            countParams.push(`%${search}%`);
        }

        const countResult = await query(countQuery, countParams);

        return {
            data: result.rows,
            total: parseInt(countResult.rows[0].total)
        };
    }

    // Get scheme by ID
    static async getById(id) {
        const result = await query(
            'SELECT * FROM schemes WHERE id = $1 AND status = $2',
            [id, 'approved']
        );
        return result.rows[0];
    }

    // Create new scheme (from approved crawl result)
    static async create(data, adminId) {
        const result = await query(
            `INSERT INTO schemes (
        title, description, state, region, category, ministry,
        eligibility_criteria, start_date, end_date, documents_required,
        source_url, source_website, status, approved_by, approved_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
                data.title, data.description, data.state, data.region, data.category,
                data.ministry, data.eligibility_criteria, data.start_date, data.end_date,
                data.documents_required, data.source_url, data.source_website,
                'approved', adminId
            ]
        );

        if (result.lastID) {
            return await this.getById(result.lastID);
        }
        return null;
    }

    // Update scheme
    static async update(id, data) {
        await query(
            `UPDATE schemes SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        state = COALESCE($3, state),
        region = COALESCE($4, region),
        category = COALESCE($5, category),
        ministry = COALESCE($6, ministry),
        eligibility_criteria = COALESCE($7, eligibility_criteria),
        start_date = COALESCE($8, start_date),
        end_date = COALESCE($9, end_date),
        documents_required = COALESCE($10, documents_required),
        last_updated = CURRENT_TIMESTAMP
      WHERE id = $11`,
            [
                data.title, data.description, data.state, data.region, data.category,
                data.ministry, data.eligibility_criteria, data.start_date, data.end_date,
                data.documents_required, id
            ]
        );
        return await this.getById(id);
    }

    // Delete scheme
    static async delete(id) {
        await query('DELETE FROM schemes WHERE id = $1', [id]);
    }
}

module.exports = SchemeModel;
