module.exports = (err, req, res, next) => {
    console.error(err.stack);
    
    // Default error response
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    
    res.status(statusCode).json({
        status: statusCode === 500 ? 999 : err.statusCode || 999,
        message: message,
        data: null
    });
};