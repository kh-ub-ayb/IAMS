const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/announcement.controller');
const authenticate = require('../middlewares/authenticate');
const allowRoles = require('../middlewares/allowRoles');

router.use(authenticate);

// ─── Create Announcement ──────────────────────────────────────────────────────
router.post(
    '/',
    allowRoles('Manager', 'ClassTeacher', 'SuperAdmin'),
    ctrl.createAnnouncement
);

// ─── Fetch Announcements (Students View) ──────────────────────────────────────
// Dynamically scopes to their own batch/branch based on JWT
router.get(
    '/student',
    allowRoles('Student'),
    ctrl.getStudentAnnouncements
);

// ─── Fetch Announcements (Admin View) ─────────────────────────────────────────
// Query string filters e.g. ?batchId=
router.get(
    '/',
    allowRoles('Manager', 'ClassTeacher', 'Teacher', 'SuperAdmin'),
    ctrl.getAnnouncements
);

module.exports = router;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
