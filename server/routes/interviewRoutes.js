import express from 'express';
import multer from 'multer';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
    createInterview,
    getInterviews,
    getInterview,
    submitAnswer
} from '../controllers/interviewController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/create', verifyToken, upload.single('resume'), createInterview);
router.get('/', verifyToken, getInterviews);

// Demo route (No authentication required)
router.get('/demo', async (req, res) => {
    const demoQuestions = [
        { question: "1. Explain the difference between 'let', 'const', and 'var' in JavaScript." },
        { question: "2. Tell me about a time you had to learn a new technology quickly. How did you approach it?" },
        { question: "3. Explain the concept of asynchronous programming in Node.js and Event Loops." },
        { question: "4. What is a REST API? How does it differ from GraphQL?" },
        { question: "5. How would you design a scalable system to handle millions of user uploads?" }
    ];

    res.json({
        mode: "demo",
        questions: demoQuestions
    });
});

router.get('/:id', verifyToken, getInterview);
router.post('/answer/:questionId', verifyToken, submitAnswer);

export default router;
