const path = require('path');
require('dotenv').config();

module.exports = {
    database: {
        connectionString: process.env.DATABASE_URL,
        dbPath: process.env.SQLITE_PATH || path.resolve(__dirname, '../../../database/data.db'),
        ssl: {
            rejectUnauthorized: false
        },
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }
};
