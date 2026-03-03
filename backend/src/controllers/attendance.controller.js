const attendanceService = require('../services/attendance.service');
const AppError = require('../utils/AppError');

/**
 * POST /attendance
 * Body: { subjectId, date, records: [{ studentId, status }] }
 * Teacher/ClassTeacher marks attendance for a class session.
 */
const markAttendance = async (req, res, next) => {
    try {
        const { subjectId, date, records } = req.body;

        if (!subjectId || !date || !Array.isArray(records) || records.length === 0) {
            return next(new AppError('subjectId, date, and records[] are required.', 400));
        }
        // Validate each record has studentId and status
        const invalid = records.find(r => !r.studentId || !r.status);
        if (invalid) {
            return next(new AppError('Each record must have studentId and status (Present/Absent/Late).', 400));
        }

        const result = await attendanceService.markAttendance(req.user, { subjectId, date, records });

        return res.status(201).json({
            success: true,
            message: `Attendance marked for ${result.marked} student(s).${result.duplicatesSkipped ? ` ${result.duplicatesSkipped} duplicate(s) skipped.` : ''}`,
            data: result,
        });
    } catch (err) { return next(err); }
};

/**
 * GET /attendance/subject/:subjectId?date=YYYY-MM-DD
 * Returns all attendance records for a subject on a given date.
 */
const getAttendanceByDate = async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        const { date } = req.query;
        if (!date) return next(new AppError('Query param ?date=YYYY-MM-DD is required.', 400));

        const records = await attendanceService.getAttendanceByDate({ subjectId, date });
        return res.status(200).json({ success: true, data: records });
    } catch (err) { return next(err); }
};

/**
 * GET /attendance/student/:studentId
 * Subject-wise + overall attendance for a student.
 * Query: ?semesterId=&batchId=
 * Student can only fetch their own. Manager/ClassTeacher can fetch any.
 */
const getStudentAttendance = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        // Students can only see their own attendance
        if (req.user.role === 'Student' && req.user.userId !== studentId) {
            return next(new AppError('Students can only view their own attendance.', 403));
        }

        const data = await attendanceService.getStudentAttendance(studentId, {
            semesterId: req.query.semesterId,
            batchId: req.query.batchId,
        });
        return res.status(200).json({ success: true, data });
    } catch (err) { return next(err); }
};

/**
 * GET /attendance/subject/:subjectId/summary
 * Per-student attendance summary for a subject.
 * Teacher, ClassTeacher, Manager.
 */
const getSubjectAttendanceSummary = async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        const data = await attendanceService.getSubjectAttendanceSummary(subjectId);
        return res.status(200).json({ success: true, data });
    } catch (err) { return next(err); }
};

/**
 * PATCH /attendance/correct
 * Body: { subjectId, studentId, date, status }
 * Correct a previously marked attendance entry.
 */
const updateAttendance = async (req, res, next) => {
    try {
        const { subjectId, studentId, date, status } = req.body;
        if (!subjectId || !studentId || !date || !status) {
            return next(new AppError('subjectId, studentId, date, and status are required.', 400));
        }
        const record = await attendanceService.updateAttendance(req.user, { subjectId, studentId, date, status });
        return res.status(200).json({ success: true, message: 'Attendance updated.', data: record });
    } catch (err) { return next(err); }
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
