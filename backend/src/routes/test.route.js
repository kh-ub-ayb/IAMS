const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const allowRoles = require('../middlewares/allowRoles');

/**
 * Test routes to verify RBAC middleware is working correctly.
 * These are development-only verification endpoints.
 */

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/public', (req, res) => {
    res.json({ success: true, message: 'Public route — no auth required.' });
});

// ─── Any Authenticated User ───────────────────────────────────────────────────
router.get('/protected', authenticate, (req, res) => {
    res.json({
        success: true,
        message: 'Protected route — any authenticated user.',
        user: req.user,
    });
});

// ─── SuperAdmin Only ──────────────────────────────────────────────────────────
router.get('/super-admin', authenticate, allowRoles('SuperAdmin'), (req, res) => {
    res.json({
        success: true,
        message: 'SuperAdmin-only route — access granted.',
        user: req.user,
    });
});

// ─── Manager Only ─────────────────────────────────────────────────────────────
router.get('/manager', authenticate, allowRoles('Manager'), (req, res) => {
    res.json({
        success: true,
        message: 'Manager-only route — access granted.',
        user: req.user,
    });
});

// ─── SuperAdmin or Manager ────────────────────────────────────────────────────
router.get('/admin-or-manager', authenticate, allowRoles('SuperAdmin', 'Manager'), (req, res) => {
    res.json({
        success: true,
        message: 'SuperAdmin or Manager — access granted.',
        user: req.user,
    });
});

// ─── Teacher ─────────────────────────────────────────────────────────────────
router.get('/teacher', authenticate, allowRoles('Teacher', 'ClassTeacher'), (req, res) => {
    res.json({
        success: true,
        message: 'Teacher/ClassTeacher route — access granted.',
        user: req.user,
    });
});

// ─── Student ─────────────────────────────────────────────────────────────────
router.get('/student', authenticate, allowRoles('Student'), (req, res) => {
    res.json({
        success: true,
        message: 'Student-only route — access granted.',
        user: req.user,
    });
});

module.exports = router;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
