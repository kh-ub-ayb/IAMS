const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * Semester — auto-generated when a Batch is created (8 per batch per branch).
 * Number 1..8. Belongs to a Branch (which belongs to a Batch).
 */
const semesterSchema = new mongoose.Schema(
    {
        uid: { type: String, default: uuidv4, unique: true, index: true },

        number: {
            type: Number,
            required: true,
            min: [1, 'Semester number must be between 1 and 8.'],
            max: [8, 'Semester number must be between 1 and 8.'],
        },
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: true,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            required: true,
        },
        institution: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Institution',
            required: true,
        },
        isActive: { type: Boolean, default: false },   // Only current sem is active
        isCompleted: { type: Boolean, default: false }, // Flipped during promotion
    },
    { timestamps: true, versionKey: false }
);

// A semester number must be unique within a branch
semesterSchema.index({ branch: 1, number: 1 }, { unique: true });

const Semester = mongoose.model('Semester', semesterSchema);
module.exports = Semester;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
