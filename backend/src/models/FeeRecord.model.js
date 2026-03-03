const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * FeeRecord — per-student fee record for a semester.
 * Generated from a FeeStructure. Tracks cumulative payment and fine.
 */
const paymentSchema = new mongoose.Schema(
    {
        amount: { type: Number, required: true, min: [0.01, 'Payment amount must be positive.'] },
        date: { type: Date, default: Date.now },
        mode: {
            type: String,
            enum: ['Cash', 'Online', 'DD', 'Cheque', 'Waiver'],
            default: 'Cash',
        },
        transactionId: { type: String, trim: true, default: '' },
        note: { type: String, trim: true, default: '' },
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { _id: true, timestamps: false, versionKey: false }
);

const feeRecordSchema = new mongoose.Schema(
    {
        uid: { type: String, default: uuidv4, unique: true, index: true },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        feeStructure: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FeeStructure',
            required: true,
        },
        semester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester',
            required: true,
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

        // Snapshot from FeeStructure (immutable after creation)
        totalDue: { type: Number, required: true, min: 0 },
        dueDate: { type: Date, required: true },
        finePerDay: { type: Number, default: 0 },

        // Running totals (updated on each payment)
        totalPaid: { type: Number, default: 0, min: 0 },
        fineAccrued: { type: Number, default: 0, min: 0 },

        status: {
            type: String,
            enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
            default: 'Pending',
        },

        // Full payment history
        payments: [paymentSchema],
    },
    { timestamps: true, versionKey: false }
);

// Unique fee record per student per fee structure
feeRecordSchema.index({ student: 1, feeStructure: 1 }, { unique: true });
feeRecordSchema.index({ student: 1, semester: 1 });
feeRecordSchema.index({ semester: 1, status: 1 });

const FeeRecord = mongoose.model('FeeRecord', feeRecordSchema);
module.exports = FeeRecord;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
