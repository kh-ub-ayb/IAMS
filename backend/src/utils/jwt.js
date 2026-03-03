const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a short-lived access token.
 * Payload contains: userId (_id), uid, role name, institution.
 */
const generateAccessToken = (user, roleName) => {
    return jwt.sign(
        {
            userId: user._id,
            uid: user.uid,
            role: roleName,
            institution: user.institution,
            branch: user.branch || null,
            batch: user.batch || null,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

/**
 * Generate a long-lived refresh token.
 * Minimal payload — only userId needed to look it up.
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { userId: user._id },
        config.jwt.refreshSecret,
        { expiresIn: config.jwt.refreshExpiresIn }
    );
};

/**
 * Verify an access token. Returns decoded payload or throws.
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, config.jwt.secret);
};

/**
 * Verify a refresh token. Returns decoded payload or throws.
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, config.jwt.refreshSecret);
};

/**
 * Parse expiry string like "7d", "15m" into a JS Date.
 * Used to set expiresAt on the RefreshToken document.
 */
const parseExpiry = (expiryString) => {
    const units = { s: 1, m: 60, h: 3600, d: 86400 };
    const match = expiryString.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error(`Invalid expiry format: ${expiryString}`);
    return new Date(Date.now() + parseInt(match[1]) * units[match[2]] * 1000);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    parseExpiry,
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
