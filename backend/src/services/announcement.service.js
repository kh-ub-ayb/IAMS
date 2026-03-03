const Announcement = require('../models/Announcement.model');
const AppError = require('../utils/AppError');

/**
 * createAnnouncement
 * Manager or ClassTeacher creates a notification.
 */
const createAnnouncement = async (creatorPayload, data) => {
    const { title, content, priority, batchId, branchId, semesterId, subjectId, expiresAt } = data;

    const announcement = await Announcement.create({
        title,
        content,
        priority: priority || 'Normal',
        institution: creatorPayload.institution,
        batch: batchId || null,
        branch: branchId || null,
        semester: semesterId || null,
        subject: subjectId || null,
        createdBy: creatorPayload.userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    return announcement;
};

/**
 * getStudentAnnouncements
 * Highly optimized fetch: returns global + batch + branch + semester + subject announcements
 * that apply to the requesting student.
 */
const getStudentAnnouncements = async (studentPayload) => {
    const { institution, batch, branch } = studentPayload;

    // Build the OR conditions based on the student's assigned context
    const orConditions = [
        // 1. Global (Institution-wide, no specific target)
        { batch: null, branch: null, semester: null, subject: null },
    ];

    if (batch) {
        // 2. Batch-wide (e.g. all 2023-2027 students)
        orConditions.push({ batch, branch: null, semester: null, subject: null });
    }

    if (branch) {
        // 3. Branch-wide (e.g. all CSE students)
        orConditions.push({ branch, semester: null, subject: null });
    }

    if (batch && branch) {
        // 4. Batch + Branch specific
        orConditions.push({ batch, branch, semester: null, subject: null });
    }

    // Note: To fetch semester/subject specific announcements automatically,
    // we would need to know the student's *active* semester and enrolled subjects.
    // For now, the client must pass them via query to get scoped results,
    // OR the route will only serve up to the branch level.

    const query = {
        institution,
        $or: orConditions,
    };

    // Filter out expired announcements if expiresAt is set
    query.$and = [
        { $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }
    ];

    return Announcement.find(query)
        .populate('createdBy', 'name role')
        .populate('batch', 'name')
        .populate('branch', 'name')
        .sort({ createdAt: -1 })
        .limit(50);
};

/**
 * getAnnouncementsForTarget
 * Used by teachers/managers to view announcements by scope, OR
 * used by students passing their active semester/subject IDs.
 */
const getAnnouncementsForTarget = async (institutionId, filters) => {
    const { batchId, branchId, semesterId, subjectId } = filters;

    const query = { institution: institutionId };

    // Exact match targeting
    if (batchId) query.batch = batchId;
    if (branchId) query.branch = branchId;
    if (semesterId) query.semester = semesterId;
    if (subjectId) query.subject = subjectId;

    return Announcement.find(query)
        .populate('createdBy', 'name email')
        .populate('batch', 'name')
        .populate('branch', 'name')
        .populate('semester', 'number')
        .populate('subject', 'name')
        .sort({ createdAt: -1 });
};

module.exports = {
    createAnnouncement,
    getStudentAnnouncements,
    getAnnouncementsForTarget,
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
