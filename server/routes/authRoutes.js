import express from 'express';
import { register, login, verifyUser } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify', verifyToken, verifyUser);

export default router;
