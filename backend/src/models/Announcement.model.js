const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * Announcement Schema
 * Target fields are optional. The more fields provided, the narrower the scope.
 * - Only institution: Global announcement
 * - institution + batch: Batch-wide
 * - institution + branch: Branch-wide
 * - institution + branch + semester: Semester-wide
 * - institution + subject: Subject-specific
 */
const announcementSchema = new mongoose.Schema(
    {
        uid: { type: String, default: uuidv4, unique: true, index: true },

        title: {
            type: String,
            required: [true, 'Title is required.'],
            trim: true,
            maxlength: 150,
        },
        content: {
            type: String,
            required: [true, 'Content is required.'],
            trim: true,
        },
        priority: {
            type: String,
            enum: ['Low', 'Normal', 'High', 'Urgent'],
            default: 'Normal',
        },

        // ─── Target Scope ──────────────────────────────────────────
        institution: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Institution',
            required: true,
        },
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            default: null,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            default: null,
        },
        semester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester',
            default: null,
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            default: null,
        },

        // ─── Metadata ──────────────────────────────────────────────
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expiresAt: {
            type: Date,
            default: null, // Optional auto-expiration
        },
    },
    { timestamps: true, versionKey: false }
);

// Indexes optimized for the student fetch query OR conditions
announcementSchema.index({ institution: 1, createdAt: -1 });
announcementSchema.index({ batch: 1, branch: 1, semester: 1 });
announcementSchema.index({ subject: 1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
module.exports = Announcement;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
