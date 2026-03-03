const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');
const allowRoles = require('../middlewares/allowRoles');

// ─── Public Routes ────────────────────────────────────────────────────────────

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/refresh
router.post('/refresh', authController.refresh);

// POST /auth/logout
router.post('/logout', authController.logout);

// ─── Protected Routes ─────────────────────────────────────────────────────────

// GET /auth/me — any authenticated user
router.get('/me', authenticate, authController.getMe);

// POST /auth/create-user — SuperAdmin only
// (Full user management with role-specific permissions comes in Phase 5)
router.post(
    '/create-user',
    authenticate,
    allowRoles('SuperAdmin'),
    authController.createUser
);

module.exports = router;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
