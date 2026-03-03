const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

/**
 * authenticate middleware
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and attaches the decoded payload to req.user.
 *
 * req.user = { userId, uid, role, institution }
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded; // { userId, uid, role, institution, iat, exp }
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Session expired. Please refresh your token.', 401));
        }
        return next(new AppError('Invalid token. Access denied.', 401));
    }
};

module.exports = authenticate;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
