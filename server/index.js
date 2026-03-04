import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected to Primary URI');
    } catch (err) {
        console.log('Local MongoDB offline. Spinning up In-Memory DB Fallback...');
        try {
            const mongoServer = await MongoMemoryServer.create();
            const memoryUri = mongoServer.getUri();
            await mongoose.connect(memoryUri);
            console.log('MongoDB Connected to In-Memory Fallback');
        } catch (memErr) {
            console.error('CRITICAL: Failed to start in-memory database.', memErr);
        }
    }
};

connectDB();

app.get('/', (req, res) => {
    res.send('AI Interview Agent API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
