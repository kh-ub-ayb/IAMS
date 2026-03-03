const announcementService = require('../services/announcement.service');
const AppError = require('../utils/AppError');
const User = require('../models/User.model');

/**
 * POST /announcements
 * Manager or ClassTeacher creates an announcement.
 */
const createAnnouncement = async (req, res, next) => {
    try {
        const { title, content, priority, batchId, branchId, semesterId, subjectId, expiresAt } = req.body;

        if (!title || !content) {
            return next(new AppError('title and content are required.', 400));
        }

        const data = { title, content, priority, batchId, branchId, semesterId, subjectId, expiresAt };
        const announcement = await announcementService.createAnnouncement(req.user, data);

        return res.status(201).json({
            success: true,
            message: 'Announcement published successfully.',
            data: announcement,
        });
    } catch (err) { return next(err); }
};

/**
 * GET /announcements/student
 * Student fetches all valid announcements relevant to them based on their batch/branch profile.
 */
const getStudentAnnouncements = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return next(new AppError('User not found.', 404));

        const studentPayload = {
            institution: req.user.institution,
            batch: user.batch,
            branch: user.branch
        };

        const announcements = await announcementService.getStudentAnnouncements(studentPayload);
        return res.status(200).json({ success: true, data: announcements });
    } catch (err) { return next(err); }
};

/**
 * GET /announcements
 * For Managers/Teachers to list announcements (filtered by query params).
 * ?batchId=...&branchId=...
 */
const getAnnouncements = async (req, res, next) => {
    try {
        const filters = {
            batchId: req.query.batchId,
            branchId: req.query.branchId,
            semesterId: req.query.semesterId,
            subjectId: req.query.subjectId,
        };

        const announcements = await announcementService.getAnnouncementsForTarget(req.user.institution, filters);
        return res.status(200).json({ success: true, data: announcements });
    } catch (err) { return next(err); }
};

module.exports = {
    createAnnouncement,
    getStudentAnnouncements,
    getAnnouncements,
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
