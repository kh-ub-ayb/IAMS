const authService = require('../services/auth.service');
const AppError = require('../utils/AppError');

/**
 * POST /auth/login
 * Body: { email, password }
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new AppError('Email and password are required.', 400));
        }

        const result = await authService.login(email, password);

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            data: result,
        });
    } catch (err) {
        return next(err);
    }
};

/**
 * POST /auth/refresh
 * Body: { refreshToken }
 * Issues a new access token using a valid refresh token.
 */
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return next(new AppError('Refresh token is required.', 400));
        }

        const result = await authService.refreshAccessToken(refreshToken);

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully.',
            data: result,
        });
    } catch (err) {
        return next(err);
    }
};

/**
 * POST /auth/logout
 * Body: { refreshToken }
 * Revokes the refresh token server-side.
 */
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return next(new AppError('Refresh token is required.', 400));
        }

        await authService.logout(refreshToken);

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (err) {
        return next(err);
    }
};

/**
 * POST /auth/create-user
 * Protected: SuperAdmin only (Phase 3 test).
 * Full user management flow comes in Phase 5.
 * Body: { name, email, password, roleName, institutionId }
 */
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, roleName, institutionId } = req.body;

        if (!name || !email || !password || !roleName) {
            return next(new AppError('name, email, password, and roleName are required.', 400));
        }

        const user = await authService.createUser({
            name,
            email,
            password,
            roleName,
            institutionId,
            createdById: req.user.userId, // set from JWT via authenticate middleware
        });

        return res.status(201).json({
            success: true,
            message: 'User created successfully.',
            data: user,
        });
    } catch (err) {
        return next(err);
    }
};

/**
 * GET /auth/me
 * Returns the currently authenticated user's JWT payload.
 */
const getMe = (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Authenticated user info.',
        data: req.user,
    });
};

module.exports = { login, refresh, logout, createUser, getMe };

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
