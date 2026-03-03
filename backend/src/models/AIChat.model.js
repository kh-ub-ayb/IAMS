const mongoose = require('mongoose');

/**
 * AIChat Schema
 * Stores the conversation history between a user (e.g. Student) and the AI.
 */
const aiChatSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        institution: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Institution',
            required: true,
        },
        question: {
            type: String,
            required: [true, 'Question is required.'],
            trim: true,
        },
        response: {
            type: String,
            required: true,
        },
        // We store the context snapshot used to generate the response
        // so we can debug AI behavior later (e.g. "Why did the AI say fee was unpaid?")
        contextUsed: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true, versionKey: false }
);

const AIChat = mongoose.model('AIChat', aiChatSchema);
module.exports = AIChat;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
