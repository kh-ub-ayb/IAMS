const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * Branch — e.g. CSE, ISE, AIML, CYCS
 * Belongs to a Batch.
 * Created by Manager or ClassTeacher.
 */
const branchSchema = new mongoose.Schema(
    {
        uid: { type: String, default: uuidv4, unique: true, index: true },

        name: {
            type: String,
            required: [true, 'Branch name is required. e.g. CSE'],
            trim: true,
            uppercase: true,
        },
        fullName: {
            type: String,
            trim: true,
            default: '',
            // e.g. "Computer Science & Engineering"
        },
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: [true, 'Batch reference is required.'],
        },
        institution: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Institution',
            required: true,
        },
        classTeacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // Assigned later by Manager
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

// A branch name must be unique within a batch
branchSchema.index({ batch: 1, name: 1 }, { unique: true });

const Branch = mongoose.model('Branch', branchSchema);
module.exports = Branch;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
