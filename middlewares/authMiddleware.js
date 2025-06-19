const jwt = require('jsonwebtoken');
const db = require('../config/database');

module.exports = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ status: 108, message: 'Token is required', data: null });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify user exists
        const [users] = await db.query('SELECT * FROM users WHERE user_id = ?', [decoded.userId]);
        if (users.length === 0) {
            return res.status(401).json({ status: 108, message: 'Invalid token', data: null });
        }

        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: 108, message: 'Token expired', data: null });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: 108, message: 'Invalid token', data: null });
        }
        next(error);
    }
};