const mongoose = require('mongoose');

/**
 * Attendance — one record per student per subject per date.
 * Compound unique index (subject + student + date) prevents double-marking.
 */
const attendanceSchema = new mongoose.Schema(
    {
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: [true, 'Subject is required.'],
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Student is required.'],
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Teacher is required.'],
        },
        semester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester',
            required: [true, 'Semester is required.'],
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
        date: {
            type: Date,
            required: [true, 'Date is required.'],
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ['Present', 'Absent', 'Late'],
                message: 'Status must be Present, Absent, or Late.',
            },
            default: 'Absent',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Core uniqueness constraint — prevents duplicate marking
attendanceSchema.index({ subject: 1, student: 1, date: 1 }, { unique: true });

// Fast lookup patterns
attendanceSchema.index({ student: 1, subject: 1 });
attendanceSchema.index({ subject: 1, date: 1 });
attendanceSchema.index({ teacher: 1, date: 1 });
attendanceSchema.index({ semester: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
