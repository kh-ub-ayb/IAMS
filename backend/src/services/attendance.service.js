const Attendance = require('../models/Attendance.model');
const Subject = require('../models/Subject.model');
const User = require('../models/User.model');
const { Role, ROLES } = require('../models/Role.model');
const AppError = require('../utils/AppError');

const ATTENDANCE_RISK_THRESHOLD = 75; // % below this triggers a risk flag

// ─────────────────────────────────────────────────────────────────────────────
// MARK ATTENDANCE (Teacher)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * markAttendance — Teacher marks attendance for a class session.
 *
 * @param {Object} teacherPayload  req.user (JWT)
 * @param {Object} body            { subjectId, date, records: [{ studentId, status }] }
 *
 * Validates:
 *   - Teacher is assigned to this subject
 *   - Date is not in the future
 *   - No duplicate (handled by unique index — returns clear error)
 */
const markAttendance = async (teacherPayload, { subjectId, date, records }) => {
    const { userId } = teacherPayload;

    // 1. Load subject and verify teacher
    const subject = await Subject.findById(subjectId);
    if (!subject) throw new AppError('Subject not found.', 404);
    if (!subject.isActive) throw new AppError('Subject is inactive.', 400);

    // ClassTeacher and Manager can also mark for their branch — only Teacher is restricted to assigned subject
    if (teacherPayload.role === ROLES.TEACHER) {
        if (!subject.teacher || subject.teacher.toString() !== userId.toString()) {
            throw new AppError('You are not assigned to this subject.', 403);
        }
    }

    // 2. Validate date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (attendanceDate > today) {
        throw new AppError('Attendance date cannot be in the future.', 400);
    }

    // 3. Validate all studentIds exist and belong to this branch
    const studentIds = records.map(r => r.studentId);
    const studentRole = await Role.findOne({ name: ROLES.STUDENT });
    const students = await User.find({
        _id: { $in: studentIds },
        role: studentRole._id,
        branch: subject.branch,
        isActive: true,
    }).select('_id');

    const validIds = new Set(students.map(s => s._id.toString()));
    const invalidStudents = studentIds.filter(id => !validIds.has(id.toString()));
    if (invalidStudents.length) {
        throw new AppError(
            `${invalidStudents.length} student(s) not found in this branch or inactive.`,
            400
        );
    }

    // 4. Build attendance documents
    const docs = records.map(r => ({
        subject: subjectId,
        student: r.studentId,
        teacher: userId,
        semester: subject.semester,
        branch: subject.branch,
        batch: subject.batch,
        date: attendanceDate,
        status: r.status || 'Absent',
    }));

    // 5. Insert — ordered:false lets valid records succeed even if some are duplicates
    let inserted = [];
    let duplicateCount = 0;
    try {
        const result = await Attendance.insertMany(docs, { ordered: false });
        inserted = result;
    } catch (err) {
        if (err.code === 11000) {
            // Partial success — some were duplicates
            duplicateCount = err.writeErrors?.length || 0;
            inserted = docs.length - duplicateCount;
        } else {
            throw err;
        }
    }

    return {
        marked: typeof inserted === 'number' ? inserted : inserted.length,
        duplicatesSkipped: duplicateCount,
        date: attendanceDate.toISOString().split('T')[0],
        subject: subject.name,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET ATTENDANCE FOR A DATE (Teacher view)
// ─────────────────────────────────────────────────────────────────────────────

const getAttendanceByDate = async ({ subjectId, date }) => {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    return Attendance.find({
        subject: subjectId,
        date: { $gte: attendanceDate, $lt: nextDay },
    })
        .populate('student', 'name email uid')
        .sort({ 'student.name': 1 });
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT ATTENDANCE — Subject-wise + Overall %
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getStudentAttendance — Returns subject-wise and overall attendance for a student.
 * Optionally scoped to a semester.
 */
const getStudentAttendance = async (studentId, filters = {}) => {
    const matchStage = { student: require('mongoose').Types.ObjectId.createFromHexString(studentId) };
    if (filters.semesterId) {
        matchStage.semester = require('mongoose').Types.ObjectId.createFromHexString(filters.semesterId);
    }
    if (filters.batchId) {
        matchStage.batch = require('mongoose').Types.ObjectId.createFromHexString(filters.batchId);
    }

    // Aggregate per subject
    const subjectStats = await Attendance.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$subject',
                total: { $sum: 1 },
                present: {
                    $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] },
                },
            },
        },
        {
            $addFields: {
                percentage: {
                    $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2],
                },
            },
        },
        {
            $lookup: {
                from: 'subjects',
                localField: '_id',
                foreignField: '_id',
                as: 'subjectInfo',
            },
        },
        { $unwind: '$subjectInfo' },
        {
            $project: {
                _id: 0,
                subjectId: '$_id',
                subjectName: '$subjectInfo.name',
                subjectCode: '$subjectInfo.code',
                total: 1,
                present: 1,
                absent: { $subtract: ['$total', '$present'] },
                percentage: 1,
                atRisk: { $lt: ['$percentage', ATTENDANCE_RISK_THRESHOLD] },
            },
        },
        { $sort: { subjectName: 1 } },
    ]);

    // Overall totals
    const totals = subjectStats.reduce(
        (acc, s) => {
            acc.totalClasses += s.total;
            acc.totalPresent += s.present;
            return acc;
        },
        { totalClasses: 0, totalPresent: 0 }
    );

    const overallPercentage =
        totals.totalClasses > 0
            ? Math.round((totals.totalPresent / totals.totalClasses) * 10000) / 100
            : 0;

    return {
        subjects: subjectStats,
        overall: {
            totalClasses: totals.totalClasses,
            totalPresent: totals.totalPresent,
            totalAbsent: totals.totalClasses - totals.totalPresent,
            percentage: overallPercentage,
            atRisk: overallPercentage < ATTENDANCE_RISK_THRESHOLD,
        },
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBJECT ATTENDANCE SUMMARY (Teacher / ClassTeacher)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * getSubjectAttendanceSummary — Per-student summary for a subject.
 * Used by Teacher/ClassTeacher dashboard.
 */
const getSubjectAttendanceSummary = async (subjectId) => {
    const subject = await Subject.findById(subjectId);
    if (!subject) throw new AppError('Subject not found.', 404);

    const stats = await Attendance.aggregate([
        { $match: { subject: subject._id } },
        {
            $group: {
                _id: '$student',
                total: { $sum: 1 },
                present: {
                    $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] },
                },
            },
        },
        {
            $addFields: {
                percentage: {
                    $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2],
                },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'studentInfo',
            },
        },
        { $unwind: '$studentInfo' },
        {
            $project: {
                _id: 0,
                studentId: '$_id',
                name: '$studentInfo.name',
                email: '$studentInfo.email',
                total: 1,
                present: 1,
                absent: { $subtract: ['$total', '$present'] },
                percentage: 1,
                atRisk: { $lt: ['$percentage', ATTENDANCE_RISK_THRESHOLD] },
            },
        },
        { $sort: { name: 1 } },
    ]);

    const atRiskCount = stats.filter(s => s.atRisk).length;

    return {
        subject: { name: subject.name, code: subject.code },
        totalStudents: stats.length,
        atRiskCount,
        students: stats,
    };
};

/**
 * updateAttendance — Correct a single attendance record.
 * Teacher/ClassTeacher can correct a previous entry.
 */
const updateAttendance = async (teacherPayload, { subjectId, studentId, date, status }) => {
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const record = await Attendance.findOneAndUpdate(
        {
            subject: subjectId,
            student: studentId,
            date: { $gte: attendanceDate, $lt: nextDay },
        },
        { status, teacher: teacherPayload.userId },
        { new: true }
    );

    if (!record) throw new AppError('Attendance record not found for this date.', 404);
    return record;
};

module.exports = {
    markAttendance,
    getAttendanceByDate,
    getStudentAttendance,
    getSubjectAttendanceSummary,
    updateAttendance,
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
