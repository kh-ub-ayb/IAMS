import api from './api';

export const announcementService = {
    createAnnouncement: async (data) => {
        // payload: { title, content, target: { batch, branch, semester, subject }, expiresAt }
        const res = await api.post('/announcements', data);
        return res.data;
    },

    getAnnouncements: async (filters = {}) => {
        // Manager/Teacher view
        const params = new URLSearchParams(filters).toString();
        const res = await api.get(`/announcements${params ? `?${params}` : ''}`);
        return res.data;
    },

    getStudentAnnouncements: async () => {
        // Student view (auto-scoped)
        const res = await api.get('/announcements/student');
        return res.data;
    }
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
