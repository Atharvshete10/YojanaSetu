const { query } = require('../config/database');

/**
 * Enhanced Schemes Controller
 * Handles public scheme endpoints with rich data support
 */

/**
 * List schemes with filters
 * GET /api/schemes
 */
exports.listSchemes = async (req, res, next) => {
    try {
        const {
            state,
            category,
            ministry,
            level,
            tags,
            status = 'approved',
            page = 1,
            limit = 20
        } = req.query;

        const offset = (page - 1) * limit;

        // Build query
        let queryText = `
            SELECT 
                id, external_id, slug, title, short_title, description,
                ministry, department, category, level, tags,
                target_beneficiaries, applicable_states,
                open_date, close_date, created_at
            FROM schemes
            WHERE status = $1
        `;

        const params = [status];
        let paramCount = 1;

        // State filter
        if (state && state !== 'All India') {
            paramCount++;
            queryText += ` AND ($${paramCount} = ANY(applicable_states))`;
            params.push(state);
        }

        // Category filter
        if (category) {
            paramCount++;
            queryText += ` AND category = $${paramCount}`;
            params.push(category);
        }

        // Ministry filter
        if (ministry) {
            paramCount++;
            queryText += ` AND ministry = $${paramCount}`;
            params.push(ministry);
        }

        // Level filter
        if (level) {
            paramCount++;
            queryText += ` AND level = $${paramCount}`;
            params.push(level);
        }

        // Tags filter (array contains)
        if (tags) {
            paramCount++;
            queryText += ` AND tags @> $${paramCount}`;
            params.push(Array.isArray(tags) ? tags : [tags]);
        }

        queryText += ' ORDER BY created_at DESC';

        // Pagination
        paramCount++;
        queryText += ` LIMIT $${paramCount}`;
        params.push(parseInt(limit));

        paramCount++;
        queryText += ` OFFSET $${paramCount}`;
        params.push(offset);

        const result = await query(queryText, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM schemes WHERE status = $1';
        const countParams = [status];
        let countParamCount = 1;

        if (state && state !== 'All India') {
            countParamCount++;
            countQuery += ` AND ($${countParamCount} = ANY(applicable_states))`;
            countParams.push(state);
        }

        if (category) {
            countParamCount++;
            countQuery += ` AND category = $${countParamCount}`;
            countParams.push(category);
        }

        if (ministry) {
            countParamCount++;
            countQuery += ` AND ministry = $${countParamCount}`;
            countParams.push(ministry);
        }

        if (level) {
            countParamCount++;
            countQuery += ` AND level = $${countParamCount}`;
            countParams.push(level);
        }

        if (tags) {
            countParamCount++;
            countQuery += ` AND tags @> $${countParamCount}`;
            countParams.push(Array.isArray(tags) ? tags : [tags]);
        }

        const countResult = await query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            },
            filters: {
                state,
                category,
                ministry,
                level,
                tags
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get scheme by slug
 * GET /api/schemes/:slug
 */
exports.getSchemeBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const result = await query(
            `SELECT * FROM schemes WHERE slug = $1 AND status = 'approved'`,
            [slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Scheme not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Search schemes
 * GET /api/schemes/search
 */
exports.searchSchemes = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const offset = (page - 1) * limit;

        // Full-text search
        const result = await query(
            `SELECT 
                id, external_id, slug, title, short_title, description,
                ministry, department, category, level, tags,
                applicable_states, created_at,
                ts_rank(
                    to_tsvector('english', 
                        COALESCE(title, '') || ' ' || 
                        COALESCE(description, '') || ' ' || 
                        COALESCE(ministry, '') || ' ' ||
                        COALESCE(category, '')
                    ),
                    plainto_tsquery('english', $1)
                ) AS rank
            FROM schemes
            WHERE status = 'approved'
            AND to_tsvector('english', 
                COALESCE(title, '') || ' ' || 
                COALESCE(description, '') || ' ' || 
                COALESCE(ministry, '') || ' ' ||
                COALESCE(category, '')
            ) @@ plainto_tsquery('english', $1)
            ORDER BY rank DESC, created_at DESC
            LIMIT $2 OFFSET $3`,
            [q, parseInt(limit), offset]
        );

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) as total
            FROM schemes
            WHERE status = 'approved'
            AND to_tsvector('english', 
                COALESCE(title, '') || ' ' || 
                COALESCE(description, '') || ' ' || 
                COALESCE(ministry, '') || ' ' ||
                COALESCE(category, '')
            ) @@ plainto_tsquery('english', $1)`,
            [q]
        );

        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            },
            query: q
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get scheme statistics
 * GET /api/schemes/stats
 */
exports.getStats = async (req, res, next) => {
    try {
        // Total schemes
        const totalResult = await query(
            `SELECT COUNT(*) as total FROM schemes WHERE status = 'approved'`
        );

        // By category
        const categoryResult = await query(
            `SELECT category, COUNT(*) as count
            FROM schemes
            WHERE status = 'approved' AND category IS NOT NULL
            GROUP BY category
            ORDER BY count DESC
            LIMIT 10`
        );

        // By ministry
        const ministryResult = await query(
            `SELECT ministry, COUNT(*) as count
            FROM schemes
            WHERE status = 'approved' AND ministry IS NOT NULL
            GROUP BY ministry
            ORDER BY count DESC
            LIMIT 10`
        );

        // By level
        const levelResult = await query(
            `SELECT level, COUNT(*) as count
            FROM schemes
            WHERE status = 'approved' AND level IS NOT NULL
            GROUP BY level
            ORDER BY count DESC`
        );

        // By state (top 10)
        const stateResult = await query(
            `SELECT 
                unnest(applicable_states) as state,
                COUNT(*) as count
            FROM schemes
            WHERE status = 'approved'
            GROUP BY state
            ORDER BY count DESC
            LIMIT 10`
        );

        res.json({
            success: true,
            stats: {
                total: parseInt(totalResult.rows[0].total),
                by_category: categoryResult.rows,
                by_ministry: ministryResult.rows,
                by_level: levelResult.rows,
                by_state: stateResult.rows
            }
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get filter options
 * GET /api/schemes/filters
 */
exports.getFilterOptions = async (req, res, next) => {
    try {
        // Get unique categories
        const categories = await query(
            `SELECT DISTINCT category
            FROM schemes
            WHERE status = 'approved' AND category IS NOT NULL
            ORDER BY category`
        );

        // Get unique ministries
        const ministries = await query(
            `SELECT DISTINCT ministry
            FROM schemes
            WHERE status = 'approved' AND ministry IS NOT NULL
            ORDER BY ministry`
        );

        // Get unique levels
        const levels = await query(
            `SELECT DISTINCT level
            FROM schemes
            WHERE status = 'approved' AND level IS NOT NULL
            ORDER BY level`
        );

        // Get unique states
        const states = await query(
            `SELECT DISTINCT unnest(applicable_states) as state
            FROM schemes
            WHERE status = 'approved'
            ORDER BY state`
        );

        res.json({
            success: true,
            filters: {
                categories: categories.rows.map(r => r.category),
                ministries: ministries.rows.map(r => r.ministry),
                levels: levels.rows.map(r => r.level),
                states: states.rows.map(r => r.state)
            }
        });

    } catch (error) {
        next(error);
    }
};
