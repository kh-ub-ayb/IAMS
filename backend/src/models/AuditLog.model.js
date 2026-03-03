const mongoose = require('mongoose');

/**
 * AuditLog — immutable record of every user management action.
 * Written on create / deactivate / role-change events.
 * Never deleted (soft compliance trail).
 */
const auditLogSchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            enum: [
                'USER_CREATED',
                'USER_DEACTIVATED',
                'USER_REACTIVATED',
                'USER_ROLE_CHANGED',
                'PASSWORD_CHANGED',
                'SEMESTER_PROMOTED', // Added for Phase 10
            ],
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        performedByRole: {
            type: String,
            required: true, // Stored as string snapshot — not a ref
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        targetUserRole: {
            type: String,
            required: true,
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: {}, // Extra context: batch, branch, etc.
        },
    },
    {
        timestamps: true,  // createdAt = the audit timestamp
        versionKey: false,
    }
);

// Indexes for efficient querying
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ targetUser: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
