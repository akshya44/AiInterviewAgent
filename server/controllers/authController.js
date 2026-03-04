import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'ai-interview-secret', {
        expiresIn: '30d',
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name: name || 'User',
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, credits: user.credits },
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                success: true,
                user: { _id: user._id, name: user.name, email: user.email, credits: user.credits },
                token: generateToken(user._id)
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
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error("VerifyUser Error:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
