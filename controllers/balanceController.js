const db = require('../config/database');

exports.getBalance = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const [rows] = await db.query(
            'SELECT balance FROM users WHERE user_id = ?', 
            [userId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({
                status: 108,
                message: 'User not found',
                data: null
            });
        }

        res.json({
            status: 0,
            message: 'Get balance success',
            data: {
                balance: rows[0].balance
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 999,
            message: 'Internal server error',
            data: null
        });
    }
};

exports.topUp = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                status: 102,
                message: 'Invalid amount',
                data: null
            });
        }

        // Update balance
        await db.query(
            'UPDATE users SET balance = balance + ? WHERE user_id = ?',
            [amount, userId]
        );

        // Record transaction
        const transactionId = require('crypto').randomUUID();
        await db.query(
            'INSERT INTO transactions (transaction_id, user_id, transaction_type, amount, description) VALUES (?, ?, ?, ?, ?)',
            [transactionId, userId, 'TOPUP', amount, 'Top Up Balance']
        );

        // Get updated balance
        const [rows] = await db.query(
            'SELECT balance FROM users WHERE user_id = ?', 
            [userId]
        );

        res.json({
            status: 0,
            message: 'Top Up balance success',
            data: {
                balance: rows[0].balance
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 999,
            message: 'Internal server error',
            data: null
        });
    }
};