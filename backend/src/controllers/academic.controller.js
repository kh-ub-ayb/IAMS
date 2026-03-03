const academicService = require('../services/academic.service');
const AppError = require('../utils/AppError');

// ─── BATCH ────────────────────────────────────────────────────────────────────

const createBatch = async (req, res, next) => {
    try {
        const { name, startYear, endYear } = req.body;
        if (!name || !startYear || !endYear) {
            return next(new AppError('name, startYear, and endYear are required.', 400));
        }
        const batch = await academicService.createBatch({
            name,
            startYear: Number(startYear),
            endYear: Number(endYear),
            institutionId: req.user.institution,
            createdById: req.user.userId,
        });
        return res.status(201).json({ success: true, message: 'Batch created.', data: batch });
    } catch (err) { return next(err); }
};

const getBatches = async (req, res, next) => {
    try {
        const batches = await academicService.getBatches(req.user.institution);
        return res.status(200).json({ success: true, data: batches });
    } catch (err) { return next(err); }
};

const getBatchById = async (req, res, next) => {
    try {
        const batch = await academicService.getBatchById(req.params.batchId);
        return res.status(200).json({ success: true, data: batch });
    } catch (err) { return next(err); }
};

const deleteBatch = async (req, res, next) => {
    try {
        await academicService.deleteBatch(req.params.batchId);
        return res.status(200).json({ success: true, message: 'Batch archived successfully.' });
    } catch (err) { return next(err); }
};

// ─── BRANCH ───────────────────────────────────────────────────────────────────

const createBranch = async (req, res, next) => {
    try {
        const { name, fullName, batchId } = req.body;
        if (!name || !batchId) {
            return next(new AppError('name and batchId are required.', 400));
        }
        const branch = await academicService.createBranch({
            name,
            fullName,
            batchId,
            institutionId: req.user.institution,
            createdById: req.user.userId,
        });
        return res.status(201).json({
            success: true,
            message: 'Branch created with 8 semesters auto-generated.',
            data: branch,
        });
    } catch (err) { return next(err); }
};

const getBranches = async (req, res, next) => {
    try {
        const branches = await academicService.getBranches(req.params.batchId);
        return res.status(200).json({ success: true, data: branches });
    } catch (err) { return next(err); }
};

const getAllBranches = async (req, res, next) => {
    try {
        const branches = await academicService.getAllBranches(req.user.institution);
        return res.status(200).json({ success: true, data: branches });
    } catch (err) { return next(err); }
};

const getBranchById = async (req, res, next) => {
    try {
        const branch = await academicService.getBranchById(req.params.branchId);
        return res.status(200).json({ success: true, data: branch });
    } catch (err) { return next(err); }
};

const deleteBranch = async (req, res, next) => {
    try {
        await academicService.deleteBranch(req.params.branchId);
        return res.status(200).json({ success: true, message: 'Branch deactivated successfully.' });
    } catch (err) { return next(err); }
};

// ─── SEMESTER ─────────────────────────────────────────────────────────────────

const getSemesters = async (req, res, next) => {
    try {
        const semesters = await academicService.getSemesters(req.params.branchId);
        return res.status(200).json({ success: true, data: semesters });
    } catch (err) { return next(err); }
};

const getSemesterById = async (req, res, next) => {
    try {
        const semester = await academicService.getSemesterById(req.params.semesterId);
        return res.status(200).json({ success: true, data: semester });
    } catch (err) { return next(err); }
};

const promoteSemester = async (req, res, next) => {
    try {
        const result = await academicService.promoteSemester(req.user, req.params.semesterId);
        return res.status(200).json({ success: true, ...result });
    } catch (err) { return next(err); }
};

// ─── SUBJECT ──────────────────────────────────────────────────────────────────

const createSubject = async (req, res, next) => {
    try {
        const { name, code, semesterId, credits } = req.body;
        if (!name || !code || !semesterId) {
            return next(new AppError('name, code, and semesterId are required.', 400));
        }
        const subject = await academicService.createSubject({
            name,
            code,
            semesterId,
            credits,
            createdById: req.user.userId,
        });
        return res.status(201).json({ success: true, message: 'Subject created.', data: subject });
    } catch (err) { return next(err); }
};

const getSubjects = async (req, res, next) => {
    try {
        const subjects = await academicService.getSubjects(req.params.semesterId);
        return res.status(200).json({ success: true, data: subjects });
    } catch (err) { return next(err); }
};

const getSubjectById = async (req, res, next) => {
    try {
        const subject = await academicService.getSubjectById(req.params.subjectId);
        return res.status(200).json({ success: true, data: subject });
    } catch (err) { return next(err); }
};

const deleteSubject = async (req, res, next) => {
    try {
        await academicService.deleteSubject(req.params.subjectId);
        return res.status(200).json({ success: true, message: 'Subject deactivated successfully.' });
    } catch (err) { return next(err); }
};

const assignTeacher = async (req, res, next) => {
    try {
        const { teacherId } = req.body;
        const subject = await academicService.assignTeacherToSubject(req.params.subjectId, teacherId);
        return res.status(200).json({ success: true, message: 'Teacher assigned successfully.', data: subject });
    } catch (err) { return next(err); }
};

module.exports = {
    createBatch, getBatches, getBatchById, deleteBatch,
    createBranch, getBranches, getAllBranches, getBranchById, deleteBranch,
    getSemesters, getSemesterById, promoteSemester,
    createSubject, getSubjects, getSubjectById, deleteSubject, assignTeacher,
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
