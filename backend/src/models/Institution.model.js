const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const institutionSchema = new mongoose.Schema(
    {
        uid: {
            type: String,
            default: uuidv4,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Institution name is required.'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Institution code is required.'],
            unique: true,
            trim: true,
            uppercase: true,
        },
        address: {
            type: String,
            trim: true,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Institution = mongoose.model('Institution', institutionSchema);

module.exports = Institution;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
