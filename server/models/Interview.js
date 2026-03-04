import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    jobRole: {
        type: String,
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    resumeText: {
        type: String,
        required: true,
    },
    focusArea: { type: String, default: 'Core Concepts' },
    difficulty: { type: String, default: 'Intermediate' },
    interviewType: { type: String, default: 'Technical Only' },
    questionStyle: { type: String, default: 'Conceptual' },
    interviewMode: { type: String, default: 'Practice Mode' },
    companyType: { type: String, default: 'Product-Based' },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending',
    },
    totalScore: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Interview', interviewSchema);
