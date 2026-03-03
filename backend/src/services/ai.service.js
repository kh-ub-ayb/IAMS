const AIChat = require('../models/AIChat.model');
const User = require('../models/User.model');
const attendanceService = require('./attendance.service');
const feeService = require('./fee.service');
const AppError = require('../utils/AppError');

/**
 * MOCK LLM CALL
 * In production, this would make an HTTPS request to OpenAI / Gemini / etc.
 */
const callLLM = async (prompt, studentName) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple mock heuristic based on prompt content
    if (prompt.toLowerCase().includes('fee') || prompt.toLowerCase().includes('due')) {
        const feeMatch = prompt.match(/Total Owed: .*?₹(\d+)/);
        if (feeMatch && parseInt(feeMatch[1]) > 0) {
            return `Hi ${studentName}, you currently have an outstanding fee balance of ₹${feeMatch[1]}. Please check your fee dashboard for details.`;
        }
        return `Hi ${studentName}, your fees are fully cleared. Great job!`;
    }

    if (prompt.toLowerCase().includes('attendance') || prompt.toLowerCase().includes('absent')) {
        const riskMatch = prompt.match(/atRisk: true/);
        if (riskMatch) {
            return `Warning ${studentName}: Your attendance in one or more subjects is below 75%. Please attend classes regularly to avoid penalties.`;
        }
        return `Hi ${studentName}, your attendance looks good. Keep it up!`;
    }

    return `Hello ${studentName}! I am your AI assistant. I can help you with questions about your attendance, fees, schedule, and academics.`;
};

/**
 * askAI
 * 1. Fetches student's live data
 * 2. Builds a system prompt with that context
 * 3. Calls LLM (mocked here)
 * 4. Stores the Q&A + context snapshot
 */
const askAI = async (studentPayload, question) => {
    const { userId, name, institution } = studentPayload;

    // ─── 1. FETCH LIVE CONTEXT ────────────────────────────────────────────────
    let attendanceData = {};
    let feeData = {};
    let marksData = []; // Placeholder for future Marks module

    try {
        // Fetch concurrently
        const [attReq, feeReq] = await Promise.all([
            attendanceService.getStudentAttendance(userId),
            feeService.getStudentFeeDashboard(userId),
        ]);

        // Clean up attendance payload for the LLM
        attendanceData = {
            overallPercentage: attReq.overall.percentage,
            overallAtRisk: attReq.overall.atRisk,
            subjects: attReq.subjects.map(s => ({
                name: s.subjectName,
                percentage: s.percentage,
                atRisk: s.atRisk,
            })),
        };

        // Clean up fee payload for the LLM
        feeData = {
            totalBalanceDue: feeReq.totalBalance,
            hasOverdue: feeReq.hasOverdue,
            records: feeReq.records.map(r => ({
                semester: r.semester,
                totalOwed: r.totalOwed,
                balance: r.balance,
                status: r.status,
            })),
        };

    } catch (err) {
        // If external service fails, we just provide empty context rather than crashing the chat
        console.error('Failed to fetch AI context:', err.message);
    }

    // ─── 2. BUILD PROMPT ──────────────────────────────────────────────────────
    const systemPrompt = `
You are the IAMS AI Academic Assistant for a student named ${name}.
Answer their question accurately and concisely.

--- LIVE ACADEMIC CONTEXT ---
ATTENDANCE:
Overall %: ${attendanceData.overallPercentage}% (At Risk: ${attendanceData.overallAtRisk})
Subjects: ${JSON.stringify(attendanceData.subjects)}

FEES:
Total Balance Due: ₹${feeData.totalBalanceDue} (Has Overdue: ${feeData.hasOverdue})
Records: ${JSON.stringify(feeData.records)}

MARKS:
${marksData.length ? JSON.stringify(marksData) : 'No marks recorded yet.'}
--- END CONTEXT ---

Student Question: "${question}"
`;

    // ─── 3. CALL LLM ──────────────────────────────────────────────────────────
    const response = await callLLM(systemPrompt, name);

    // ─── 4. SAVE TO HISTORY ───────────────────────────────────────────────────
    const chatRecord = await AIChat.create({
        user: userId,
        institution,
        question,
        response,
        contextUsed: { attendance: attendanceData, fees: feeData },
    });

    return {
        chatId: chatRecord._id,
        question: chatRecord.question,
        answer: chatRecord.response,
        createdAt: chatRecord.createdAt,
    };
};

/**
 * getChatHistory
 * Fetch past conversations for a student.
 */
const getChatHistory = async (userId, limit = 20) => {
    return AIChat.find({ user: userId })
        .select('question response createdAt')
        .sort({ createdAt: -1 })
        .limit(limit);
};

module.exports = {
    askAI,
    getChatHistory,
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
