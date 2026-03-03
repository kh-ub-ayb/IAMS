import api from './api';

export const aiService = {
    askQuestion: async (question) => {
        // payload: { question }
        const res = await api.post('/ai/ask', { question });
        return res.data;
    },

    getHistory: async () => {
        const res = await api.get('/ai/history');
        return res.data;
    }
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
