const userService = require('../services/user.service');
const AppError = require('../utils/AppError');

/**
 * POST /users
 * Creates a user — role-based permission enforced in the service.
 */
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, roleName, batchId, branchId } = req.body;
        if (!name || !email || !password || !roleName) {
            return next(new AppError('name, email, password, and roleName are required.', 400));
        }

        const user = await userService.createUser(req.user, {
            name, email, password, roleName, batchId, branchId,
        });

        return res.status(201).json({
            success: true,
            message: `${roleName} created successfully.`,
            data: user,
        });
    } catch (err) { return next(err); }
};

/**
 * GET /users
 * Lists users — scope determined by service based on caller role.
 * Optional query: ?roleName=Teacher
 */
const getUsers = async (req, res, next) => {
    try {
        const users = await userService.getUsers(req.user, {
            roleName: req.query.roleName,
        });
        return res.status(200).json({ success: true, data: users });
    } catch (err) { return next(err); }
};

/**
 * GET /users/:userId
 */
const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.userId);
        return res.status(200).json({ success: true, data: user });
    } catch (err) { return next(err); }
};

/**
 * PATCH /users/:userId/deactivate
 * Soft-disables a user. Only Manager and SuperAdmin can do this.
 */
const deactivateUser = async (req, res, next) => {
    try {
        const result = await userService.deactivateUser(req.user, req.params.userId);
        return res.status(200).json({ success: true, ...result });
    } catch (err) { return next(err); }
};

/**
 * GET /users/audit-logs
 * Fetch audit trail. Query: ?targetUserId=&action=USER_CREATED
 */
const getAuditLogs = async (req, res, next) => {
    try {
        const logs = await userService.getAuditLogs({
            targetUserId: req.query.targetUserId,
            performedById: req.query.performedById,
            action: req.query.action,
        });
        return res.status(200).json({ success: true, data: logs });
    } catch (err) { return next(err); }
};

module.exports = { createUser, getUsers, getUserById, deactivateUser, getAuditLogs };

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
