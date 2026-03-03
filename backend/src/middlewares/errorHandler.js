const logger = require('../utils/logger');

/**
 * Centralized error handler middleware.
 * Always placed last in the Express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    // Log the full error internally
    logger.error(`${err.message}`, err);

    const statusCode = err.statusCode || 500;
    const message = err.isOperational
        ? err.message
        : 'An unexpected error occurred. Please try again later.';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        },
    });
};

module.exports = errorHandler;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
