const FeeStructure = require('../models/FeeStructure.model');
const FeeRecord = require('../models/FeeRecord.model');
const User = require('../models/User.model');
const { Role, ROLES } = require('../models/Role.model');
const AppError = require('../utils/AppError');

// ─── FEE STRUCTURE ────────────────────────────────────────────────────────────

/**
 * createFeeStructure — Manager only.
 * Total is auto-computed from components if not provided.
 */
const createFeeStructure = async (managerPayload, data) => {
    const { title, semesterId, batchId, branchId, components, dueDate, finePerDay } = data;

    // Calculate totalAmount from components
    const totalAmount = components.reduce((sum, c) => sum + c.amount, 0);
    if (totalAmount <= 0) throw new AppError('Total fee amount must be greater than 0.', 400);

    const structure = await FeeStructure.create({
        title,
        semester: semesterId,
        batch: batchId,
        branch: branchId,
        institution: managerPayload.institution,
        components,
        totalAmount,
        dueDate: new Date(dueDate),
        finePerDay: finePerDay || 0,
        createdBy: managerPayload.userId,
    });

    return structure;
};

const getFeeStructures = async (institutionId) => {
    return FeeStructure.find({ institution: institutionId, isActive: true })
        .populate('semester', 'number')
        .populate('batch', 'name')
        .populate('branch', 'name')
        .sort({ createdAt: -1 });
};

const getFeeStructureById = async (id) => {
    const s = await FeeStructure.findById(id)
        .populate('semester', 'number')
        .populate('batch', 'name startYear endYear')
        .populate('branch', 'name')
        .populate('createdBy', 'name email');
    if (!s) throw new AppError('Fee structure not found.', 404);
    return s;
};

// ─── ASSIGN FEES TO STUDENTS ──────────────────────────────────────────────────

/**
 * assignFeeToStudents — Creates a FeeRecord for every active Student in the branch+semester.
 * Idempotent — skips students who already have a record.
 */
const assignFeeToStudents = async (feeStructureId, callerPayload) => {
    const structure = await FeeStructure.findById(feeStructureId);
    if (!structure) throw new AppError('Fee structure not found.', 404);

    const studentRole = await Role.findOne({ name: ROLES.STUDENT });
    const students = await User.find({
        role: studentRole._id,
        branch: structure.branch,
        batch: structure.batch,
        isActive: true,
    }).select('_id');

    if (students.length === 0) {
        throw new AppError('No active students found in this batch/branch.', 404);
    }

    const docs = students.map(s => ({
        student: s._id,
        feeStructure: structure._id,
        semester: structure.semester,
        batch: structure.batch,
        branch: structure.branch,
        institution: structure.institution,
        totalDue: structure.totalAmount,
        dueDate: structure.dueDate,
        finePerDay: structure.finePerDay,
    }));

    // insertMany ordered:false — skips duplicates gracefully
    let assigned = 0;
    try {
        const result = await FeeRecord.insertMany(docs, { ordered: false });
        assigned = result.length;
    } catch (err) {
        if (err.code === 11000) {
            assigned = docs.length - (err.writeErrors?.length || 0);
        } else throw err;
    }

    return { totalStudents: students.length, assigned, alreadyExisted: students.length - assigned };
};

// ─── PAYMENT ──────────────────────────────────────────────────────────────────

/**
 * recordPayment — adds a payment entry and updates totals + status.
 */
const recordPayment = async (callerPayload, { feeRecordId, amount, mode, transactionId, note }) => {
    const record = await FeeRecord.findById(feeRecordId);
    if (!record) throw new AppError('Fee record not found.', 404);

    const paymentAmount = Number(amount);
    if (paymentAmount <= 0) throw new AppError('Payment amount must be positive.', 400);

    const remaining = record.totalDue + record.fineAccrued - record.totalPaid;
    if (paymentAmount > remaining) {
        throw new AppError(`Payment amount (${paymentAmount}) exceeds remaining balance (${remaining}).`, 400);
    }

    // Calculate fine at time of payment
    const fine = calculateFineAmount(record);
    record.fineAccrued = fine;

    record.payments.push({
        amount: paymentAmount,
        date: new Date(),
        mode: mode || 'Cash',
        transactionId: transactionId || '',
        note: note || '',
        recordedBy: callerPayload.userId,
    });

    record.totalPaid += paymentAmount;

    // Update status
    const totalOwed = record.totalDue + record.fineAccrued;
    if (record.totalPaid >= totalOwed) {
        record.status = 'Paid';
    } else if (record.totalPaid > 0) {
        record.status = 'Partial';
    } else if (new Date() > record.dueDate) {
        record.status = 'Overdue';
    }

    await record.save();

    return {
        feeRecordId: record._id,
        totalDue: record.totalDue,
        fineAccrued: record.fineAccrued,
        totalPaid: record.totalPaid,
        balance: totalOwed - record.totalPaid,
        status: record.status,
    };
};

// ─── FINE CALCULATION ─────────────────────────────────────────────────────────

/**
 * calculateFineAmount — computes fine based on days overdue × finePerDay.
 * Fine applies only when dueDate has passed and record is not already Paid.
 */
const calculateFineAmount = (record) => {
    if (record.status === 'Paid' || record.finePerDay === 0) return 0;
    const now = new Date();
    if (now <= record.dueDate) return 0;
    const daysOverdue = Math.floor((now - record.dueDate) / (1000 * 60 * 60 * 24));
    return daysOverdue * record.finePerDay;
};

/**
 * refreshFines — recalculates and persists fineAccrued for all overdue records.
 * Called manually by Manager or can be run as a cron job.
 */
const refreshFines = async (institutionId) => {
    const overdueRecords = await FeeRecord.find({
        institution: institutionId,
        status: { $in: ['Pending', 'Partial', 'Overdue'] },
        dueDate: { $lt: new Date() },
        finePerDay: { $gt: 0 },
    });

    let updated = 0;
    for (const rec of overdueRecords) {
        const fine = calculateFineAmount(rec);
        rec.fineAccrued = fine;
        rec.status = rec.totalPaid > 0 ? 'Partial' : 'Overdue';
        await rec.save();
        updated++;
    }
    return { recordsUpdated: updated };
};

// ─── STUDENT FEE DASHBOARD ────────────────────────────────────────────────────

/**
 * getStudentFeeDashboard — returns all fee records for a student with live balance.
 */
const getStudentFeeDashboard = async (studentId) => {
    const records = await FeeRecord.find({ student: studentId })
        .populate('feeStructure', 'title components')
        .populate('semester', 'number')
        .populate('batch', 'name')
        .populate('branch', 'name')
        .sort({ createdAt: -1 });

    const dashboard = records.map(r => {
        const liveFinе = calculateFineAmount(r);
        const totalOwed = r.totalDue + liveFinе;
        const balance = Math.max(0, totalOwed - r.totalPaid);
        return {
            feeRecordId: r._id,
            uid: r.uid,
            semester: `Semester ${r.semester?.number || '?'}`,
            batch: r.batch?.name,
            branch: r.branch?.name,
            structure: r.feeStructure?.title,
            components: r.feeStructure?.components || [],
            totalDue: r.totalDue,
            fineAccrued: liveFinе,
            totalOwed,
            totalPaid: r.totalPaid,
            balance,
            status: balance === 0 ? 'Paid' : r.status,
            dueDate: r.dueDate,
            payments: r.payments,
        };
    });

    const totalBalance = dashboard.reduce((s, r) => s + r.balance, 0);
    const hasOverdue = dashboard.some(r => r.status === 'Overdue');

    return { records: dashboard, totalBalance, hasOverdue };
};

/**
 * getFeeRecords — Manager sees all records for a semester/branch.
 */
const getFeeRecords = async ({ semesterId, branchId, status }) => {
    const query = {};
    if (semesterId) query.semester = semesterId;
    if (branchId) query.branch = branchId;
    if (status) query.status = status;

    return FeeRecord.find(query)
        .populate('student', 'name email uid')
        .populate('semester', 'number')
        .populate('branch', 'name')
        .sort({ 'student.name': 1 });
};

module.exports = {
    createFeeStructure,
    getFeeStructures,
    getFeeStructureById,
    assignFeeToStudents,
    recordPayment,
    refreshFines,
    getStudentFeeDashboard,
    getFeeRecords,
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
