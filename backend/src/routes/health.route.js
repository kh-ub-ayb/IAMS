const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Public health check endpoint.
 * Returns server status and timestamp.
 */
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'IAMS API is operational.',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
