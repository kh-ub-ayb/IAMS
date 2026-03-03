const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * Allowed role names — single source of truth.
 * Import ROLES anywhere you need to reference a role name.
 */
const ROLES = Object.freeze({
    SUPER_ADMIN: 'SuperAdmin',
    MANAGER: 'Manager',
    CLASS_TEACHER: 'ClassTeacher',
    TEACHER: 'Teacher',
    STUDENT: 'Student',
});

const roleSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Role name is required.'],
            unique: true,
            enum: {
                values: Object.values(ROLES),
                message: '{VALUE} is not a valid role.',
            },
            trim: true,
        },
        description: {
            type: String,
            default: '',
            trim: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Role = mongoose.model('Role', roleSchema);

module.exports = { Role, ROLES };

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
