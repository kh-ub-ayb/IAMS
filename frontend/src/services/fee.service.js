import api from './api';

export const feeService = {
    // --- Structures ---
    getFeeStructures: async () => {
        const res = await api.get('/fees/structures');
        return res.data;
    },
    createFeeStructure: async (data) => {
        // payload: { semesterId, branchId, baseAmount, components: [{name, amount}], dueDate, finePerDay }
        const res = await api.post('/fees/structures', data);
        return res.data;
    },

    // --- Assignment ---
    assignFeeToStudents: async (structureId) => {
        const res = await api.post(`/fees/structures/${structureId}/assign`);
        return res.data;
    },

    // --- Records & Payments (Manager) ---
    getFeeRecords: async (filters = {}) => {
        // ?semesterId=&branchId=&status=Overdue
        const params = new URLSearchParams(filters).toString();
        const res = await api.get(`/fees/records${params ? `?${params}` : ''}`);
        return res.data;
    },
    recordPayment: async (data) => {
        // payload: { studentId, feeStructureId, amount, paymentMethod, referenceNumber }
        const res = await api.post('/fees/payments', data);
        return res.data;
    },
    refreshFines: async () => {
        const res = await api.post('/fees/refresh-fines');
        return res.data;
    },

    // --- Student Dashboard ---
    getStudentFeeDashboard: async (studentId) => {
        const res = await api.get(`/fees/student/${studentId}`);
        return res.data;
    }
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
