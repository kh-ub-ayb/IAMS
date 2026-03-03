const Batch = require('../models/Batch.model');
const Branch = require('../models/Branch.model');
const Semester = require('../models/Semester.model');
const Subject = require('../models/Subject.model');
const User = require('../models/User.model');
const AuditLog = require('../models/AuditLog.model');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// BATCH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * createBatch — Manager only.
 * Auto-generates 8 Semester documents for every Branch added later.
 * (Semesters are generated per-Branch in createBranch / addBranchSemesters.)
 */
const createBatch = async ({ name, startYear, endYear, institutionId, createdById }) => {
    // Prevent duplicate batch names in the same institution
    const existing = await Batch.findOne({ name, institution: institutionId });
    if (existing) throw new AppError(`Batch "${name}" already exists.`, 409);

    if (endYear <= startYear) {
        throw new AppError('End year must be greater than start year.', 400);
    }

    const batch = await Batch.create({
        name,
        startYear,
        endYear,
        institution: institutionId,
        createdBy: createdById,
    });

    return batch;
};

const getBatches = async (institutionId) => {
    return Batch.find({ institution: institutionId, isArchived: false })
        .sort({ startYear: -1 })
        .populate('createdBy', 'name email');
};

const getBatchById = async (batchId) => {
    const batch = await Batch.findById(batchId).populate('createdBy', 'name email');
    if (!batch) throw new AppError('Batch not found.', 404);
    return batch;
};

const deleteBatch = async (batchId) => {
    const batch = await Batch.findByIdAndUpdate(batchId, { isArchived: true }, { new: true });
    if (!batch) throw new AppError('Batch not found.', 404);
    return batch;
};

// ─────────────────────────────────────────────────────────────────────────────
// BRANCH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * createBranch — Manager only.
 * Auto-generates 8 Semester documents for this branch immediately.
 */
const createBranch = async ({ name, fullName, batchId, institutionId, createdById }) => {
    const batch = await Batch.findById(batchId);
    if (!batch) throw new AppError('Batch not found.', 404);
    if (batch.isArchived) throw new AppError('Cannot add branches to an archived batch.', 400);

    const branch = await Branch.create({
        name,
        fullName,
        batch: batchId,
        institution: institutionId,
        createdBy: createdById,
    });

    // Auto-generate 8 semesters for this branch
    const semesterDocs = Array.from({ length: 8 }, (_, i) => ({
        number: i + 1,
        batch: batchId,
        branch: branch._id,
        institution: institutionId,
        isActive: i === 0, // Semester 1 is active by default
    }));

    await Semester.insertMany(semesterDocs);

    return branch;
};

const getAllBranches = async (institutionId) => {
    return Branch.find({ institution: institutionId, isActive: true })
        .populate('batch', 'name startYear endYear')
        .populate('classTeacher', 'name email')
        .sort({ name: 1 });
};

const getBranches = async (batchId) => {
    return Branch.find({ batch: batchId, isActive: true })
        .populate('classTeacher', 'name email')
        .sort({ name: 1 });
};

const getBranchById = async (branchId) => {
    const branch = await Branch.findById(branchId)
        .populate('batch', 'name startYear endYear')
        .populate('classTeacher', 'name email');
    if (!branch) throw new AppError('Branch not found.', 404);
    return branch;
};

const deleteBranch = async (branchId) => {
    const branch = await Branch.findByIdAndUpdate(branchId, { isActive: false }, { new: true });
    if (!branch) throw new AppError('Branch not found.', 404);
    return branch;
};

// ─────────────────────────────────────────────────────────────────────────────
// SEMESTER
// ─────────────────────────────────────────────────────────────────────────────

const getSemesters = async (branchId) => {
    return Semester.find({ branch: branchId })
        .sort({ number: 1 })
        .populate('branch', 'name')
        .populate('batch', 'name');
};

const getSemesterById = async (semesterId) => {
    const sem = await Semester.findById(semesterId)
        .populate('branch', 'name')
        .populate('batch', 'name startYear endYear');
    if (!sem) throw new AppError('Semester not found.', 404);
    return sem;
};

const promoteSemester = async (callerPayload, currentSemesterId) => {
    try {
        const currentSem = await Semester.findById(currentSemesterId);
        if (!currentSem) throw new AppError('Current semester not found.', 404);
        if (!currentSem.isActive) throw new AppError('Current semester is not active.', 400);
        if (currentSem.isCompleted) throw new AppError('Semester is already completed.', 400);

        if (currentSem.number === 8) {
            throw new AppError('Cannot promote beyond Semester 8. Use graduation flow instead.', 400);
        }

        const nextSemNumber = currentSem.number + 1;
        const nextSem = await Semester.findOne({
            branch: currentSem.branch,
            number: nextSemNumber,
        });

        if (!nextSem) throw new AppError(`Next semester (${nextSemNumber}) not found.`, 404);

        // 1. Mark current semester as completed and inactive
        currentSem.isActive = false;
        currentSem.isCompleted = true;
        await currentSem.save();

        // 2. Mark next semester as active
        nextSem.isActive = true;
        await nextSem.save();

        // 3. Write Audit Log
        await AuditLog.create({
            action: 'SEMESTER_PROMOTED',
            performedBy: callerPayload.userId,
            performedByRole: callerPayload.role,
            targetUser: callerPayload.userId, // Dummy target for system action
            targetUserRole: 'System',
            meta: {
                branchId: currentSem.branch,
                fromSemester: currentSem.number,
                toSemester: nextSem.number,
            }
        });

        return {
            message: `Successfully promoted branch from Semester ${currentSem.number} to ${nextSem.number}.`,
            fromSemester: currentSem._id,
            toSemester: nextSem._id,
        };

    } catch (error) {
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBJECT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * createSubject — Manager or ClassTeacher.
 * Validates semester belongs to the given branch.
 */
const createSubject = async ({ name, code, semesterId, credits, createdById }) => {
    const semester = await Semester.findById(semesterId)
        .populate('branch')
        .populate('batch');
    if (!semester) throw new AppError('Semester not found.', 404);

    const subject = await Subject.create({
        name,
        code,
        semester: semesterId,
        branch: semester.branch._id,
        batch: semester.batch._id,
        institution: semester.institution,
        credits: credits || 0,
        createdBy: createdById,
    });

    return subject;
};

const getSubjects = async (semesterId) => {
    return Subject.find({ semester: semesterId, isActive: true })
        .sort({ name: 1 })
        .populate('teacher', 'name email');
};

const getSubjectById = async (subjectId) => {
    const subject = await Subject.findById(subjectId)
        .populate('semester', 'number')
        .populate('branch', 'name')
        .populate('batch', 'name')
        .populate('teacher', 'name email');
    if (!subject) throw new AppError('Subject not found.', 404);
    return subject;
};

const deleteSubject = async (subjectId) => {
    const subject = await Subject.findByIdAndUpdate(subjectId, { isActive: false }, { new: true });
    if (!subject) throw new AppError('Subject not found.', 404);
    return subject;
};

/**
 * assignTeacherToSubject — ClassTeacher assigns a Teacher to a Subject.
 */
const assignTeacherToSubject = async (subjectId, teacherId) => {
    const subject = await Subject.findById(subjectId);
    if (!subject) throw new AppError('Subject not found.', 404);
    if (!subject.isActive) throw new AppError('Cannot assign teacher to an inactive subject.', 400);

    if (teacherId) {
        const teacher = await User.findById(teacherId).populate('role', 'name');
        if (!teacher) throw new AppError('Teacher not found.', 404);
        if (teacher.role.name !== 'Teacher' && teacher.role.name !== 'ClassTeacher') {
            throw new AppError('Selected user is not a Teacher or ClassTeacher.', 400);
        }
    }

    subject.teacher = teacherId || null;
    await subject.save();

    return Subject.findById(subjectId)
        .populate('teacher', 'name email')
        .populate('semester', 'number')
        .populate('branch', 'name')
        .populate('batch', 'name');
};

module.exports = {
    createBatch, getBatches, getBatchById, deleteBatch,
    createBranch, getBranches, getAllBranches, getBranchById, deleteBranch,
    getSemesters, getSemesterById, promoteSemester,
    createSubject, getSubjects, getSubjectById, deleteSubject, assignTeacherToSubject,
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
