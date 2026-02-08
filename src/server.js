import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import dotenv from 'dotenv';

import schemeRoutes from './routes/schemeRoutes.js';
import tenderRoutes from './routes/tenderRoutes.js';
import recruitmentRoutes from './routes/recruitmentRoutes.js';
import statRoutes from './routes/statRoutes.js';
import { initDb } from './database/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;



// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

const publicPath = resolve(__dirname, 'public');
app.use(express.static(publicPath));

// Routes
app.use('/api/schemes', schemeRoutes);
app.use('/api/tenders', tenderRoutes);
app.use('/api/recruitments', recruitmentRoutes);
app.use('/api/stats', statRoutes);

// Fallback for SPA
app.get('*', (req, res) => {
    res.sendFile(resolve('src/public/index.html'));
});

// Initialize DB and Start Server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});

