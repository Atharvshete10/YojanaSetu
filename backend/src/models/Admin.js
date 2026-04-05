const { query } = require('../config/database');
const bcrypt = require('bcrypt');

const AdminModel = {
    async findByEmail(email) {
        const result = await query('SELECT id, email, password_hash, username as name, role, is_active FROM admins WHERE email = $1', [email]);
        return result.rows[0];
    },

    async findById(id) {
        const result = await query('SELECT id, email, username as name, role, is_active FROM admins WHERE id = $1', [id]);
        return result.rows[0];
    },

    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    },

    async create({ email, password, name, role = 'moderator' }) {
        const password_hash = await bcrypt.hash(password, 10);
        const result = await query(
            'INSERT INTO admins (email, password_hash, username, role) VALUES ($1, $2, $3, $4)',
            [email, password_hash, name, role]
        );
        return { id: result.lastID, email, name, role };
    },

    async getAll() {
        const result = await query('SELECT id, email, username as name, role, is_active FROM admins');
        return result.rows;
    },

    async update(id, { name, email, password }) {
        let sql = 'UPDATE admins SET username = $1, email = $2';
        const params = [name, email];
        
        if (password) {
            const hash = await bcrypt.hash(password, 10);
            sql += ', password_hash = $3 WHERE id = $4';
            params.push(hash, id);
        } else {
            sql += ' WHERE id = $3';
            params.push(id);
        }
        
        await query(sql, params);
        return this.findById(id);
    }
};

module.exports = AdminModel;
