const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendance.controller');
const authenticate = require('../middlewares/authenticate');
const allowRoles = require('../middlewares/allowRoles');

router.use(authenticate);

// ─── Mark Attendance ──────────────────────────────────────────────────────────
// Teacher, ClassTeacher, Manager can mark
router.post(
    '/',
    allowRoles('Teacher', 'ClassTeacher', 'Manager'),
    ctrl.markAttendance
);

// ─── Correct Attendance ────────────────────────────────────────────────────────
router.patch(
    '/correct',
    allowRoles('Teacher', 'ClassTeacher', 'Manager'),
    ctrl.updateAttendance
);

// ─── Subject Attendance Summary ────────────────────────────────────────────────
// Teacher/ClassTeacher/Manager see class-level stats
router.get(
    '/subject/:subjectId/summary',
    allowRoles('Teacher', 'ClassTeacher', 'Manager', 'SuperAdmin'),
    ctrl.getSubjectAttendanceSummary
);

// ─── Attendance for a Date ────────────────────────────────────────────────────
// GET /attendance/subject/:subjectId?date=YYYY-MM-DD
router.get(
    '/subject/:subjectId',
    allowRoles('Teacher', 'ClassTeacher', 'Manager', 'SuperAdmin'),
    ctrl.getAttendanceByDate
);

// ─── Student Dashboard ─────────────────────────────────────────────────────────
// Student can only fetch own; Teachers/Manager see any student
router.get(
    '/student/:studentId',
    allowRoles('Student', 'Teacher', 'ClassTeacher', 'Manager', 'SuperAdmin'),
    ctrl.getStudentAttendance
);

module.exports = router;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
