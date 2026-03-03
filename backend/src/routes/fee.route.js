const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/fee.controller');
const authenticate = require('../middlewares/authenticate');
const allowRoles = require('../middlewares/allowRoles');

router.use(authenticate);

// ─── Fee Structures ───────────────────────────────────────────────────────────
router.post(
    '/structures',
    allowRoles('Manager'),
    ctrl.createFeeStructure
);
router.get(
    '/structures',
    allowRoles('SuperAdmin', 'Manager', 'ClassTeacher'),
    ctrl.getFeeStructures
);
router.get(
    '/structures/:structureId',
    allowRoles('SuperAdmin', 'Manager', 'ClassTeacher'),
    ctrl.getFeeStructureById
);

// ─── Assign Fees to All Students in a Branch ─────────────────────────────────
router.post(
    '/structures/:structureId/assign',
    allowRoles('Manager'),
    ctrl.assignFeeToStudents
);

// ─── Fee Records (Manager view — all students) ────────────────────────────────
// Query: ?semesterId=&branchId=&status=Overdue
router.get(
    '/records',
    allowRoles('SuperAdmin', 'Manager'),
    ctrl.getFeeRecords
);

// ─── Record Payment ───────────────────────────────────────────────────────────
router.post(
    '/payments',
    allowRoles('Manager', 'SuperAdmin'),
    ctrl.recordPayment
);

// ─── Refresh Fines (Manager triggers manually) ────────────────────────────────
router.post(
    '/refresh-fines',
    allowRoles('Manager', 'SuperAdmin'),
    ctrl.refreshFines
);

// ─── Student Fee Dashboard ────────────────────────────────────────────────────
router.get(
    '/student/:studentId',
    allowRoles('Student', 'Manager', 'SuperAdmin', 'ClassTeacher'),
    ctrl.getStudentFeeDashboard
);

module.exports = router;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
