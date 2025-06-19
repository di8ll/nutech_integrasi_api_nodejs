const db = require('../config/database');
const balanceService = require('../services/balanceService');

exports.getBalance = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        
        // Get user balance
        const [users] = await db.query('SELECT balance FROM users WHERE user_id = ?', [userId]);
        const user = users[0];

        res.status(200).json({
            status: 0,
            message: 'Get balance successful',
            data: { balance: user.balance }
        });
    } catch (error) {
        next(error);
    }
};

exports.topUpBalance = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ status: 102, message: 'Invalid amount', data: null });
        }

        // Update balance
        await balanceService.topUp(userId, amount);

        // Create transaction record
        const transactionId = require('crypto').randomUUID();
        await db.query(
            'INSERT INTO transactions (transaction_id, user_id, transaction_type, amount, description) VALUES (?, ?, ?, ?, ?)',
            [transactionId, userId, 'TOPUP', amount, 'Top up balance']
        );

        // Get updated balance
        const [users] = await db.query('SELECT balance FROM users WHERE user_id = ?', [userId]);
        const user = users[0];

        res.status(200).json({
            status: 0,
            message: 'Top up balance successful',
            data: { balance: user.balance }
        });
    } catch (error) {
        next(error);
    }
};