import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || process.env.VITE_MONGO_URI || 'mongodb://localhost:27017/ai-interview-agent')
    .then(async () => {
        console.log("Connected to DB");
        try {
            await mongoose.connection.collection('users').dropIndexes();
            console.log("Dropped legacy 'users' collection indexes successfully.");
        } catch (e) {
            console.log("Error dropping indexes (they might not exist):", e.message);
        }
        process.exit(0);
    }).catch(e => {
        console.log("Connection error", e);
        process.exit(1);
    });
