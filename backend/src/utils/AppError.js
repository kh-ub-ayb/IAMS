/**
 * Custom operational error class.
 * Use this for known, expected errors (e.g., 404, 401, 400).
 * The errorHandler middleware uses isOperational to decide
 * whether to expose the message to the client.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
