const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Authentication routes
router.post('/registration', authController.register);
router.post('/login', authController.login);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/profile', authMiddleware, authController.getProfile);

// Balance routes
router.get('/balance', authMiddleware, userController.getBalance);
router.post('/topup', authMiddleware, userController.topUpBalance);

// Transaction routes
router.get('/transaction/history', authMiddleware, transactionController.getTransactionHistory);
router.post('/transaction', authMiddleware, transactionController.createTransaction);
router.get('/services', authMiddleware, transactionController.getServices);

module.exports = router;