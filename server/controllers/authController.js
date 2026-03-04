import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'ai-interview-secret', {
        expiresIn: '30d',
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name: name || 'User',
                email,
                password: hashedPassword,
            }
        });

        res.status(201).json({
            success: true,
            user: { _id: user.id, name: user.name, email: user.email, credits: user.credits },
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                success: true,
                user: { _id: user.id, name: user.name, email: user.email, credits: user.credits },
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const verifyUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, credits: true, createdAt: true }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("VerifyUser Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
