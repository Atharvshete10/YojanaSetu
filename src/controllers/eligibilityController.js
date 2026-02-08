const { query } = require('../config/database');

/**
 * Eligibility Controller
 * Handles eligibility checking for schemes
 */

/**
 * Check eligibility for schemes
 * POST /api/eligibility/check
 */
exports.checkEligibility = async (req, res, next) => {
    try {
        const {
            age,
            gender,
            state,
            category,
            annual_income,
            has_bank_account,
            employment_status,
            occupation_type
        } = req.body;

        // Validate required fields
        if (!age || !state) {
            return res.status(400).json({
                success: false,
                message: 'Age and state are required fields'
            });
        }

        // Save eligibility check
        const checkResult = await query(
            `INSERT INTO eligibility_checks (
                age, gender, state, category, annual_income,
                has_bank_account, employment_status, occupation_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [age, gender, state, category, annual_income, has_bank_account, employment_status, occupation_type]
        );

        const checkId = checkResult.rows[0].id;

        // Get matching schemes using eligibility function
        // For now, we'll use a simplified matching algorithm
        // The database function can be enhanced later

        let matchQuery = `
            SELECT 
                id, slug, title, short_title, description,
                ministry, department, category, level,
                benefits, eligibility, tags, applicable_states,
                (
                    -- State matching (30 points)
                    CASE 
                        WHEN 'All India' = ANY(applicable_states) THEN 30
                        WHEN $2 = ANY(applicable_states) THEN 30
                        ELSE 0
                    END +
                    
                    -- Bank account requirement (20 points)
                    CASE 
                        WHEN eligibility->>'requires_bank_account' = 'true' AND $5 = true THEN 20
                        WHEN eligibility->>'requires_bank_account' IS NULL THEN 15
                        ELSE 0
                    END +
                    
                    -- Category matching (20 points)
                    CASE 
                        WHEN eligibility->'categories' @> to_jsonb($3::text) THEN 20
                        WHEN eligibility->'categories' IS NULL THEN 10
                        ELSE 0
                    END +
                    
                    -- Age matching (20 points)
                    CASE 
                        WHEN eligibility->>'min_age' IS NOT NULL 
                            AND $1 >= (eligibility->>'min_age')::INTEGER 
                            AND $1 <= COALESCE((eligibility->>'max_age')::INTEGER, 999)
                        THEN 20
                        WHEN eligibility->>'min_age' IS NULL THEN 10
                        ELSE 0
                    END +
                    
                    -- Income criteria (10 points)
                    CASE 
                        WHEN eligibility->>'max_income' IS NOT NULL 
                            AND $4 <= (eligibility->>'max_income')::DECIMAL 
                        THEN 10
                        WHEN eligibility->>'max_income' IS NULL THEN 5
                        ELSE 0
                    END
                ) AS match_score
            FROM schemes
            WHERE status = 'approved'
            HAVING match_score >= 40
            ORDER BY match_score DESC
            LIMIT 50
        `;

        const matchResult = await query(matchQuery, [
            age,
            state,
            category || 'general',
            annual_income || 0,
            has_bank_account || false
        ]);

        const eligibleSchemes = matchResult.rows;
        const eligibleCount = eligibleSchemes.length;

        // Update eligibility check with results
        await query(
            `UPDATE eligibility_checks
            SET eligible_schemes = $1, eligible_count = $2
            WHERE id = $3`,
            [eligibleSchemes.map(s => s.id), eligibleCount, checkId]
        );

        res.json({
            success: true,
            check_id: checkId,
            eligible_count: eligibleCount,
            schemes: eligibleSchemes.map(scheme => ({
                id: scheme.id,
                slug: scheme.slug,
                title: scheme.title,
                short_title: scheme.short_title,
                description: scheme.description,
                ministry: scheme.ministry,
                department: scheme.department,
                category: scheme.category,
                level: scheme.level,
                benefits: scheme.benefits,
                eligibility: scheme.eligibility,
                tags: scheme.tags,
                applicable_states: scheme.applicable_states,
                match_score: scheme.match_score
            }))
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Get eligibility check by ID
 * GET /api/eligibility/:id
 */
exports.getEligibilityCheck = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT * FROM eligibility_checks WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Eligibility check not found'
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
