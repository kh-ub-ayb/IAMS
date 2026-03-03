const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required.'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required.'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
        },
        password: {
            type: String,
            required: [true, 'Password is required.'],
            minlength: [8, 'Password must be at least 8 characters.'],
            select: false,
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: [true, 'Role is required.'],
        },
        institution: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Institution',
            default: null,
        },
        // ─── Academic assignment (ClassTeacher, Teacher, Student) ──────────────
        batch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            default: null,
        },
        branch: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Branch',
            default: null,
        },
        // ─── Governance ────────────────────────────────────────────────────────
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Method ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
