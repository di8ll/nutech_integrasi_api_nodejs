const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const jwtService = require('../services/jwtService');

exports.register = async (req, res, next) => {
    try {
        const { email, first_name, last_name, password } = req.body;
        
        // Check if email already exists
        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ status: 102, message: 'Email already registered', data: null });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = require('crypto').randomUUID();

        // Insert new user
        await db.query(
            'INSERT INTO users (user_id, email, first_name, last_name, password) VALUES (?, ?, ?, ?, ?)',
            [userId, email, first_name, last_name, hashedPassword]
        );

        // Generate token
        const token = jwtService.generateToken(userId);

        res.status(200).json({
            status: 0,
            message: 'Registration successful',
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ status: 103, message: 'Invalid email or password', data: null });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 103, message: 'Invalid email or password', data: null });
        }

        // Generate token
        const token = jwtService.generateToken(user.user_id);

        res.status(200).json({
            status: 0,
            message: 'Login successful',
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { first_name, last_name } = req.body;
        
        // Update user profile
        await db.query(
            'UPDATE users SET first_name = ?, last_name = ? WHERE user_id = ?',
            [first_name, last_name, userId]
        );

        // Get updated profile
        const [users] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        const user = users[0];

        res.status(200).json({
            status: 0,
            message: 'Update profile successful',
            data: {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_image: user.profile_image
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        
        // Get user profile
        const [users] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
        const user = users[0];

        res.status(200).json({
            status: 0,
            message: 'Get profile successful',
            data: {
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_image: user.profile_image
            }
        });
    } catch (error) {
        next(error);
    }
};