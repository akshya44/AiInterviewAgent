import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';

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

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

app.get('/', (req, res) => {
    res.send('AI Interview Agent API is running...');
});

// For Vercel serverless — export app instead of calling listen
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
