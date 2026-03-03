import api from './api';

export const academicService = {
    // --- Batches ---
    getAllBatches: async () => {
        const res = await api.get('/academic/batches');
        return res.data;
    },

    createBatch: async (batchData) => {
        const res = await api.post('/academic/batches', batchData);
        return res.data;
    },

    deleteBatch: async (batchId) => {
        const res = await api.delete(`/academic/batches/${batchId}`);
        return res.data;
    },

    // --- Branches ---
    getAllBranches: async () => {
        const res = await api.get('/academic/branches');
        return res.data;
    },

    createBranch: async (branchData) => {
        const res = await api.post('/academic/branches', branchData);
        return res.data;
    },

    deleteBranch: async (branchId) => {
        const res = await api.delete(`/academic/branches/${branchId}`);
        return res.data;
    },

    // --- Semesters ---
    getSemestersByBranch: async (branchId) => {
        const res = await api.get(`/academic/branches/${branchId}/semesters`);
        return res.data;
    },

    // --- Subjects ---
    getSubjectsBySemester: async (semesterId) => {
        const res = await api.get(`/academic/semesters/${semesterId}/subjects`);
        return res.data;
    },

    createSubject: async (semesterId, subjectData) => {
        const res = await api.post('/academic/subjects', { ...subjectData, semesterId });
        return res.data;
    },

    deleteSubject: async (subjectId) => {
        const res = await api.delete(`/academic/subjects/${subjectId}`);
        return res.data;
    },

    assignTeacher: async (subjectId, teacherId) => {
        const res = await api.patch(`/academic/subjects/${subjectId}/assign-teacher`, { teacherId });
        return res.data;
    }
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
