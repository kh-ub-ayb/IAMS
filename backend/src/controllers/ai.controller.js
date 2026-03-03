const aiService = require('../services/ai.service');
const AppError = require('../utils/AppError');

/**
 * POST /ai/ask
 * Student asks a question. Handled by the AI service which builds context.
 */
const askAI = async (req, res, next) => {
    try {
        const { question } = req.body;
        if (!question || question.trim().length === 0) {
            return next(new AppError('Question is required.', 400));
        }

        const answer = await aiService.askAI(req.user, question);
        return res.status(200).json({ success: true, data: answer });
    } catch (err) { return next(err); }
};

/**
 * GET /ai/history
 * Fetch previous AI conversations.
 */
const getChatHistory = async (req, res, next) => {
    try {
        const history = await aiService.getChatHistory(req.user.userId, req.query.limit);
        return res.status(200).json({ success: true, data: history });
    } catch (err) { return next(err); }
};

module.exports = {
    askAI,
    getChatHistory,
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
