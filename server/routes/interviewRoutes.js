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
router.get('/:id', verifyToken, getInterview);
router.post('/answer/:questionId', verifyToken, submitAnswer);

export default router;
