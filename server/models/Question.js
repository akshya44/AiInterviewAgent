import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Interview',
        required: true,
    },
    questionText: {
        type: String,
        required: true,
    },
    userAnswer: {
        type: String,
        default: '',
    },
    aiFeedback: {
        type: String,
        default: '',
    },
    score: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model('Question', questionSchema);
