const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const allowRoles = require('../middlewares/allowRoles');

// All user management routes require authentication
router.use(authenticate);

// ─── Create User ──────────────────────────────────────────────────────────────
// SuperAdmin, Manager, ClassTeacher can create — specific target-role rules
// enforced in the service layer via CREATION_RULES matrix.
router.post(
    '/',
    allowRoles('SuperAdmin', 'Manager', 'ClassTeacher'),
    userCtrl.createUser
);

// ─── List Users ───────────────────────────────────────────────────────────────
// ?roleName=Teacher optional filter
router.get(
    '/',
    allowRoles('SuperAdmin', 'Manager', 'ClassTeacher'),
    userCtrl.getUsers
);

// ─── Audit Logs ──────────────────────────────────────────────────────────────
// Must be before /:userId to avoid route collision
router.get(
    '/audit-logs',
    allowRoles('SuperAdmin', 'Manager'),
    userCtrl.getAuditLogs
);

// ─── Single User ──────────────────────────────────────────────────────────────
router.get(
    '/:userId',
    allowRoles('SuperAdmin', 'Manager', 'ClassTeacher'),
    userCtrl.getUserById
);

// ─── Deactivate User ─────────────────────────────────────────────────────────
router.patch(
    '/:userId/deactivate',
    allowRoles('SuperAdmin', 'Manager'),
    userCtrl.deactivateUser
);

module.exports = router;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
