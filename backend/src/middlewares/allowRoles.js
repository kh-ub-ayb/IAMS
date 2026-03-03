const AppError = require('../utils/AppError');

/**
 * allowRoles(...roles) — RBAC middleware factory.
 *
 * Usage:
 *   router.post('/create', authenticate, allowRoles('SuperAdmin', 'Manager'), handler)
 *
 * Must be used AFTER the authenticate middleware (req.user must exist).
 */
const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required.', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}.`,
                    403
                )
            );
        }

        return next();
    };
};

module.exports = allowRoles;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
