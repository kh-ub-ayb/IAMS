const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * FeeStructure — semester-wise fee blueprint created by Manager.
 * Components break down the total (e.g. Tuition, Lab, Library fees).
 * FeeRecords are generated per student from this structure.
 */
const feeStructureSchema = new mongoose.Schema(
    {
        uid: { type: String, default: uuidv4, unique: true, index: true },

        title: {
            type: String,
            required: [true, 'Fee structure title is required.'],
            trim: true,
            // e.g. "Semester 1 – 2023-2027 CSE"
        },
        semester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester',
            required: [true, 'Semester is required.'],
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
        // Itemized breakdown
        components: [
            {
                label: { type: String, required: true }, // e.g. "Tuition Fee"
                amount: { type: Number, required: true, min: 0 },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: [0, 'Total amount cannot be negative.'],
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required.'],
        },
        // Fine settings
        finePerDay: {
            type: Number,
            default: 0,  // Fine in ₹ per day after dueDate
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

// Unique structure per semester+branch
feeStructureSchema.index({ semester: 1, branch: 1 }, { unique: true });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
module.exports = FeeStructure;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
