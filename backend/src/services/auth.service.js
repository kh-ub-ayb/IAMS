const User = require('../models/User.model');
const { Role } = require('../models/Role.model');
const RefreshToken = require('../models/RefreshToken.model');
const AppError = require('../utils/AppError');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    parseExpiry,
} = require('../utils/jwt');
const config = require('../config/env');

/**
 * login(email, password)
 * Validates credentials and returns access + refresh tokens.
 */
const login = async (email, password) => {
    // Explicitly select password (excluded by default)
    const user = await User.findOne({ email }).select('+password').populate('role', 'name');

    if (!user || !user.isActive) {
        throw new AppError('Invalid credentials.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError('Invalid credentials.', 401);
    }

    const roleName = user.role?.name || '';

    // Generate tokens
    const accessToken = generateAccessToken(user, roleName);
    const refreshTokenStr = generateRefreshToken(user);

    // Persist refresh token in DB
    await RefreshToken.create({
        token: refreshTokenStr,
        user: user._id,
        expiresAt: parseExpiry(config.jwt.refreshExpiresIn),
    });

    return {
        accessToken,
        refreshToken: refreshTokenStr,
        user: {
            id: user._id,
            uid: user.uid,
            name: user.name,
            email: user.email,
            role: roleName,
            institution: user.institution,
        },
    };
};

/**
 * refreshAccessToken(refreshToken)
 * Validates stored refresh token and issues a new access token.
 */
const refreshAccessToken = async (refreshTokenStr) => {
    // 1. Verify JWT signature & expiry
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshTokenStr);
    } catch {
        throw new AppError('Invalid or expired refresh token.', 401);
    }

    // 2. Check it exists in DB and is not revoked
    const stored = await RefreshToken.findOne({ token: refreshTokenStr });
    if (!stored || stored.isRevoked) {
        throw new AppError('Refresh token revoked or not found.', 401);
    }

    // 3. Load user + role
    const user = await User.findById(decoded.userId).populate('role', 'name');
    if (!user || !user.isActive) {
        throw new AppError('User not found or inactive.', 401);
    }

    const roleName = user.role?.name || '';
    const newAccessToken = generateAccessToken(user, roleName);

    return { accessToken: newAccessToken };
};

/**
 * logout(refreshToken)
 * Revokes the given refresh token in the DB.
 */
const logout = async (refreshTokenStr) => {
    await RefreshToken.findOneAndUpdate(
        { token: refreshTokenStr },
        { isRevoked: true }
    );
};

/**
 * createUser({ name, email, password, roleName, institutionId, createdById })
 * Manual user creation — no public registration.
 * Called by controllers after RBAC permission check.
 */
const createUser = async ({ name, email, password, roleName, institutionId, createdById }) => {
    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
        throw new AppError('A user with this email already exists.', 409);
    }

    // Find the role by name
    const role = await Role.findOne({ name: roleName });
    if (!role) {
        throw new AppError(`Role "${roleName}" not found.`, 400);
    }

    const user = await User.create({
        name,
        email,
        password,          // Pre-save hook will hash this
        role: role._id,
        institution: institutionId || null,
        createdBy: createdById || null,
    });

    return {
        id: user._id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: roleName,
        createdAt: user.createdAt,
    };
};

module.exports = { login, refreshAccessToken, logout, createUser };

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
