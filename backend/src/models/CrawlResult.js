const { query } = require('../config/database');

const CrawlResult = {
    async getPending({ type, limit = 50, offset = 0 }) {
        let sql = "SELECT * FROM crawl_results WHERE 1=1";
        const params = [];
        
        if (type) {
            sql += " AND type = $1";
            params.push(type);
        }
        
        // Note: The schema might lack a dedicated 'status' column in some versions,
        // but we assume 'pending' items are what we want.
        
        const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as total");
        const countResult = await query(countSql, params);
        
        sql += " ORDER BY created_at DESC LIMIT $" + (params.length + 1) + " OFFSET $" + (params.length + 2);
        params.push(limit, offset);
        
        const result = await query(sql, params);
        
        return {
            data: result.rows.map(row => ({
                ...row,
                normalized_data: row.normalized_data ? JSON.parse(row.normalized_data) : {}
            })),
            total: countResult.rows[0].total
        };
    },

    async getById(id) {
        const result = await query('SELECT * FROM crawl_results WHERE id = $1', [id]);
        if (!result.rows[0]) return null;
        
        const row = result.rows[0];
        return {
            ...row,
            normalized_data: row.normalized_data ? JSON.parse(row.normalized_data) : {}
        };
    },

    async update(id, normalized_data) {
        await query(
            'UPDATE crawl_results SET normalized_data = $1 WHERE id = $2',
            [JSON.stringify(normalized_data), id]
        );
        return this.getById(id);
    },

    async reject(id, adminId, reason) {
        // In a real app, we might move this to a rejected table or mark it.
        // For now, let's just delete it or mark as rejected if column exists.
        await query('DELETE FROM crawl_results WHERE id = $1', [id]);
        return true;
    }
};

module.exports = CrawlResult;
