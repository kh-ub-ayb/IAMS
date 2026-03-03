const feeService = require('../services/fee.service');
const AppError = require('../utils/AppError');

// ─── FEE STRUCTURE ────────────────────────────────────────────────────────────

const createFeeStructure = async (req, res, next) => {
    try {
        const { title, semesterId, batchId, branchId, components, dueDate, finePerDay } = req.body;
        if (!title || !semesterId || !batchId || !branchId || !components || !dueDate) {
            return next(new AppError('title, semesterId, batchId, branchId, components, and dueDate are required.', 400));
        }
        if (!Array.isArray(components) || components.length === 0) {
            return next(new AppError('components must be a non-empty array of { label, amount }.', 400));
        }
        const structure = await feeService.createFeeStructure(req.user, req.body);
        return res.status(201).json({ success: true, message: 'Fee structure created.', data: structure });
    } catch (err) { return next(err); }
};

const getFeeStructures = async (req, res, next) => {
    try {
        const structures = await feeService.getFeeStructures(req.user.institution);
        return res.status(200).json({ success: true, data: structures });
    } catch (err) { return next(err); }
};

const getFeeStructureById = async (req, res, next) => {
    try {
        const structure = await feeService.getFeeStructureById(req.params.structureId);
        return res.status(200).json({ success: true, data: structure });
    } catch (err) { return next(err); }
};

// ─── ASSIGN FEES ──────────────────────────────────────────────────────────────

const assignFeeToStudents = async (req, res, next) => {
    try {
        const result = await feeService.assignFeeToStudents(req.params.structureId, req.user);
        return res.status(200).json({
            success: true,
            message: `Fees assigned to ${result.assigned} student(s). ${result.alreadyExisted} already existed.`,
            data: result,
        });
    } catch (err) { return next(err); }
};

// ─── FEE RECORDS ─────────────────────────────────────────────────────────────

const getFeeRecords = async (req, res, next) => {
    try {
        const records = await feeService.getFeeRecords({
            semesterId: req.query.semesterId,
            branchId: req.query.branchId,
            status: req.query.status,   // Pending | Partial | Paid | Overdue
        });
        return res.status(200).json({ success: true, data: records });
    } catch (err) { return next(err); }
};

// ─── PAYMENT ──────────────────────────────────────────────────────────────────

const recordPayment = async (req, res, next) => {
    try {
        const { feeRecordId, amount, mode, transactionId, note } = req.body;
        if (!feeRecordId || !amount) {
            return next(new AppError('feeRecordId and amount are required.', 400));
        }
        const result = await feeService.recordPayment(req.user, { feeRecordId, amount, mode, transactionId, note });
        return res.status(200).json({ success: true, message: 'Payment recorded.', data: result });
    } catch (err) { return next(err); }
};

// ─── REFRESH FINES ────────────────────────────────────────────────────────────

const refreshFines = async (req, res, next) => {
    try {
        const result = await feeService.refreshFines(req.user.institution);
        return res.status(200).json({
            success: true,
            message: `Fines refreshed for ${result.recordsUpdated} overdue record(s).`,
            data: result,
        });
    } catch (err) { return next(err); }
};

// ─── STUDENT DASHBOARD ────────────────────────────────────────────────────────

const getStudentFeeDashboard = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        // Students can only view their own
        if (req.user.role === 'Student' && req.user.userId !== studentId) {
            return next(new AppError('Students can only view their own fee data.', 403));
        }

        const data = await feeService.getStudentFeeDashboard(studentId);
        return res.status(200).json({ success: true, data });
    } catch (err) { return next(err); }
};

module.exports = {
    createFeeStructure,
    getFeeStructures,
    getFeeStructureById,
    assignFeeToStudents,
    getFeeRecords,
    recordPayment,
    refreshFines,
    getStudentFeeDashboard,
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
