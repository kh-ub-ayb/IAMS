const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * Subject — belongs to a Semester (which belongs to Branch → Batch).
 * Created by Manager or ClassTeacher.
 * Teacher is assigned to subject.
 */
const subjectSchema = new mongoose.Schema(
    {
        uid: { type: String, default: uuidv4, unique: true, index: true },

        name: {
            type: String,
            required: [true, 'Subject name is required.'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Subject code is required. e.g. CS301'],
            trim: true,
            uppercase: true,
        },
        semester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester',
            required: [true, 'Semester reference is required.'],
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: true,
        },
        institution: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Institution',
            required: true,
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // Assigned later by ClassTeacher
        },
        credits: {
            type: Number,
            default: 0,
            min: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false }
);

// Subject code must be unique within a semester
subjectSchema.index({ semester: 1, code: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
