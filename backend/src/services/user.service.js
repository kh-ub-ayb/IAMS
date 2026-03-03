const User = require('../models/User.model');
const { Role, ROLES } = require('../models/Role.model');
const Batch = require('../models/Batch.model');
const Branch = require('../models/Branch.model');
const AuditLog = require('../models/AuditLog.model');
const AppError = require('../utils/AppError');

// ─── Permission Matrix ────────────────────────────────────────────────────────
// Defines which roles a creator can create.
const CREATION_RULES = {
    [ROLES.SUPER_ADMIN]: [ROLES.MANAGER],
    [ROLES.MANAGER]: [ROLES.CLASS_TEACHER, ROLES.TEACHER, ROLES.STUDENT],
    [ROLES.CLASS_TEACHER]: [ROLES.STUDENT],
};

/**
 * createUser — enforces the hierarchy and writes an audit log.
 *
 * @param {Object} creatorPayload  - req.user (JWT payload)
 * @param {Object} newUserData     - body fields
 */
const createUser = async (creatorPayload, newUserData) => {
    const { userId, role: creatorRoleName, institution } = creatorPayload;
    const { name, email, password, roleName, batchId, branchId } = newUserData;

    // 1. Enforce creation permission
    const allowed = CREATION_RULES[creatorRoleName] || [];
    if (!allowed.includes(roleName)) {
        throw new AppError(
            `A ${creatorRoleName} cannot create a ${roleName}.`,
            403
        );
    }

    // 2. Resolve target role document
    const roleDoc = await Role.findOne({ name: roleName });
    if (!roleDoc) throw new AppError(`Role "${roleName}" not found.`, 400);

    // 3. Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) throw new AppError('A user with this email already exists.', 409);

    // 4. Validate batch & branch for roles that require them
    const requiresBatch = [ROLES.CLASS_TEACHER, ROLES.STUDENT];
    let resolvedBatch = null;
    let resolvedBranch = null;

    if (requiresBatch.includes(roleName)) {
        if (!batchId) throw new AppError(`batchId is required when creating a ${roleName}.`, 400);
        if (!branchId) throw new AppError(`branchId is required when creating a ${roleName}.`, 400);

        resolvedBatch = await Batch.findById(batchId);
        if (!resolvedBatch) throw new AppError('Batch not found.', 404);
        if (resolvedBatch.isArchived) throw new AppError('Cannot assign users to an archived batch.', 400);

        resolvedBranch = await Branch.findOne({ _id: branchId, batch: batchId });
        if (!resolvedBranch) throw new AppError('Branch not found or does not belong to the given batch.', 404);
    }

    // 5. Create the user
    const user = await User.create({
        name,
        email,
        password,
        role: roleDoc._id,
        institution: institution || null,
        batch: resolvedBatch?._id || null,
        branch: resolvedBranch?._id || null,
        createdBy: userId,
    });

    // 6. Write audit log
    await AuditLog.create({
        action: 'USER_CREATED',
        performedBy: userId,
        performedByRole: creatorRoleName,
        targetUser: user._id,
        targetUserRole: roleName,
        meta: {
            email: user.email,
            batchId: resolvedBatch?._id || null,
            branchId: resolvedBranch?._id || null,
        },
    });

    return {
        id: user._id,
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: roleName,
        batch: resolvedBatch?.name || null,
        branch: resolvedBranch?.name || null,
        createdAt: user.createdAt,
    };
};

/**
 * getUsers — fetch users created by caller (or all for SuperAdmin).
 */
const getUsers = async (callerPayload, filters = {}) => {
    const { role: callerRole, userId, institution } = callerPayload;
    const query = {};

    if (callerRole === ROLES.SUPER_ADMIN) {
        // SuperAdmin sees everything — no institution filter
    } else if (callerRole === ROLES.MANAGER) {
        if (institution) query.institution = institution;
        // Manager sees all except other SuperAdmins
        const superAdminRole = await Role.findOne({ name: ROLES.SUPER_ADMIN });
        query.role = { $ne: superAdminRole._id };
    } else if (callerRole === ROLES.CLASS_TEACHER) {
        // ClassTeacher only sees users in their branch
        query.branch = callerPayload.branch;
    } else {
        throw new AppError('Access denied.', 403);
    }

    if (filters.roleName) {
        const r = await Role.findOne({ name: filters.roleName });
        if (r) query.role = r._id;
    }

    return User.find(query)
        .populate('role', 'name')
        .populate('batch', 'name')
        .populate('branch', 'name')
        .populate('createdBy', 'name email')
        .select('-password')
        .sort({ createdAt: -1 });
};

/**
 * getUserById — fetch single user with populated fields.
 */
const getUserById = async (userId) => {
    const user = await User.findById(userId)
        .populate('role', 'name')
        .populate('batch', 'name startYear endYear')
        .populate('branch', 'name fullName')
        .populate('institution', 'name code')
        .populate('createdBy', 'name email')
        .select('-password');
    if (!user) throw new AppError('User not found.', 404);
    return user;
};

/**
 * deactivateUser — soft disable with audit log.
 */
const deactivateUser = async (callerPayload, targetUserId) => {
    const user = await User.findById(targetUserId).populate('role', 'name');
    if (!user) throw new AppError('User not found.', 404);

    user.isActive = false;
    await user.save();

    await AuditLog.create({
        action: 'USER_DEACTIVATED',
        performedBy: callerPayload.userId,
        performedByRole: callerPayload.role,
        targetUser: user._id,
        targetUserRole: user.role.name,
        meta: { email: user.email },
    });

    return { message: `User ${user.email} has been deactivated.` };
};

/**
 * getAuditLogs — fetch audit trail (SuperAdmin/Manager only).
 */
const getAuditLogs = async (filters = {}) => {
    const query = {};
    if (filters.targetUserId) query.targetUser = filters.targetUserId;
    if (filters.performedById) query.performedBy = filters.performedById;
    if (filters.action) query.action = filters.action;

    return AuditLog.find(query)
        .populate('performedBy', 'name email')
        .populate('targetUser', 'name email')
        .sort({ createdAt: -1 })
        .limit(100);
};

module.exports = { createUser, getUsers, getUserById, deactivateUser, getAuditLogs };

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
