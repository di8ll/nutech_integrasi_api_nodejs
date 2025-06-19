const db = require('../config/database');

module.exports = {
    topUp: async (userId, amount) => {
        await db.query('UPDATE users SET balance = balance + ? WHERE user_id = ?', [amount, userId]);
    },
    
    deduct: async (userId, amount) => {
        await db.query('UPDATE users SET balance = balance - ? WHERE user_id = ?', [amount, userId]);
    }
};