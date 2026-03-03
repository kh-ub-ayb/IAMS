import api from './api';

export const userService = {
    getUsers: async (filters = {}) => {
        // Example filters: { roleName: 'Student', branch: '123' }
        const params = new URLSearchParams(filters).toString();
        const res = await api.get(`/users${params ? `?${params}` : ''}`);
        return res.data;
    },

    getUserById: async (userId) => {
        const res = await api.get(`/users/${userId}`);
        return res.data;
    },

    createUser: async (userData) => {
        const res = await api.post('/users', userData);
        return res.data;
    },

    deactivateUser: async (userId) => {
        const res = await api.patch(`/users/${userId}/deactivate`);
        return res.data;
    }
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
