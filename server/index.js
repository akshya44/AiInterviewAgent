import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enable SQLite WAL mode globally for better concurrency
prisma.$executeRawUnsafe('PRAGMA journal_mode=WAL;').catch(console.error);

// Allow both local dev and Vercel/Render production frontend
const allowedOrigins = [
    'http://localhost:5173',
    /\.vercel\.app$/,
    /\.onrender\.com$/,
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

import path from 'path';
import { fileURLToPath } from 'url';

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

// --- Production deployment config ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the static frontend files
if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
    const clientDistPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientDistPath));

    app.get('*', (req, res) => {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('AI Interview Agent API is running in Development mode...');
    });
}

// Ensure the server always listens on a port in production
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
