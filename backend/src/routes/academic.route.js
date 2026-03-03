const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/academic.controller');
const authenticate = require('../middlewares/authenticate');
const allowRoles = require('../middlewares/allowRoles');

// All academic routes require authentication
router.use(authenticate);

// ─── BATCH ────────────────────────────────────────────────────────────────────
// Only Manager can create a batch
router.post('/batches', allowRoles('Manager'), ctrl.createBatch);
router.get('/batches', allowRoles('SuperAdmin', 'Manager', 'ClassTeacher'), ctrl.getBatches);
router.get('/batches/:batchId', allowRoles('SuperAdmin', 'Manager', 'ClassTeacher', 'Teacher'), ctrl.getBatchById);
router.delete('/batches/:batchId', allowRoles('Manager'), ctrl.deleteBatch);

// ─── BRANCH ───────────────────────────────────────────────────────────────────
// Manager creates branches; ClassTeacher can view
router.post('/branches', allowRoles('Manager'), ctrl.createBranch);
router.get('/branches', allowRoles('SuperAdmin', 'Manager', 'ClassTeacher', 'Teacher', 'Student'), ctrl.getAllBranches);
router.get('/batches/:batchId/branches', allowRoles('SuperAdmin', 'Manager', 'ClassTeacher', 'Teacher', 'Student'), ctrl.getBranches);
router.get('/branches/:branchId', allowRoles('SuperAdmin', 'Manager', 'ClassTeacher', 'Teacher', 'Student'), ctrl.getBranchById);
router.delete('/branches/:branchId', allowRoles('Manager'), ctrl.deleteBranch);

// ─── SEMESTER ─────────────────────────────────────────────────────────────────
// Semesters are auto-generated — no POST needed here
router.get('/branches/:branchId/semesters', allowRoles('SuperAdmin', 'Manager', 'ClassTeacher', 'Teacher', 'Student'), ctrl.getSemesters);
router.get('/semesters/:semesterId', allowRoles('SuperAdmin', 'Manager', 'ClassTeacher', 'Teacher', 'Student'), ctrl.getSemesterById);

// Manager promotes a semester (transactional)
router.patch('/semesters/:semesterId/promote', allowRoles('Manager'), ctrl.promoteSemester);

// ─── SUBJECT ──────────────────────────────────────────────────────────────────
// Manager or ClassTeacher can create subjects
router.post('/subjects', allowRoles('Manager', 'ClassTeacher'), ctrl.createSubject);
router.get('/semesters/:semesterId/subjects', allowRoles('SuperAdmin', 'Manager', 'ClassTeacher', 'Teacher', 'Student'), ctrl.getSubjects);
router.get('/subjects/:subjectId', allowRoles('SuperAdmin', 'Manager', 'ClassTeacher', 'Teacher', 'Student'), ctrl.getSubjectById);
router.delete('/subjects/:subjectId', allowRoles('Manager'), ctrl.deleteSubject);
router.patch('/subjects/:subjectId/assign-teacher', allowRoles('ClassTeacher', 'Manager'), ctrl.assignTeacher);

module.exports = router;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
