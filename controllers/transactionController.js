const db = require('../config/database');
const balanceService = require('../services/balanceService');

exports.getTransactionHistory = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { offset = 0, limit = 10 } = req.query;
        
        // Get transaction history with pagination
        const [transactions] = await db.query(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [userId, parseInt(limit), parseInt(offset)]
        );

        // Get total count for pagination info
        const [totalCount] = await db.query(
            'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({
            status: 0,
            message: 'Get transaction history successful',
            data: {
                offset: parseInt(offset),
                limit: parseInt(limit),
                records: transactions.map(tx => ({
                    invoice_number: tx.transaction_id,
                    transaction_type: tx.transaction_type,
                    description: tx.description,
                    total_amount: tx.amount,
                    created_on: tx.created_at
                })),
                total: totalCount[0].total
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.createTransaction = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { service_code } = req.body;
        
        // Get service details
        const [services] = await db.query('SELECT * FROM services WHERE service_code = ?', [service_code]);
        if (services.length === 0) {
            return res.status(400).json({ status: 104, message: 'Service not found', data: null });
        }

        const service = services[0];
        
        // Check user balance
        const [users] = await db.query('SELECT balance FROM users WHERE user_id = ?', [userId]);
        const user = users[0];
        
        if (user.balance < service.service_tariff) {
            return res.status(400).json({ status: 105, message: 'Insufficient balance', data: null });
        }

        // Deduct balance
        await balanceService.deduct(userId, service.service_tariff);

        // Create transaction record
        const transactionId = require('crypto').randomUUID();
        await db.query(
            'INSERT INTO transactions (transaction_id, user_id, transaction_type, service_code, service_name, amount, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [transactionId, userId, 'PAYMENT', service.service_code, service.service_name, service.service_tariff, `Payment for ${service.service_name}`]
        );

        // Get updated balance
        const [updatedUsers] = await db.query('SELECT balance FROM users WHERE user_id = ?', [userId]);
        const updatedUser = updatedUsers[0];

        res.status(200).json({
            status: 0,
            message: 'Transaction successful',
            data: {
                invoice_number: transactionId,
                service_code: service.service_code,
                service_name: service.service_name,
                transaction_type: 'PAYMENT',
                total_amount: service.service_tariff,
                balance: updatedUser.balance
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getServices = async (req, res, next) => {
    try {
        // Get all services
        const [services] = await db.query('SELECT * FROM services');
        
        res.status(200).json({
            status: 0,
            message: 'Get services successful',
            data: services.map(service => ({
                service_code: service.service_code,
                service_name: service.service_name,
                service_icon: service.service_icon,
                service_tariff: service.service_tariff
            }))
        });
    } catch (error) {
        next(error);
    }
};