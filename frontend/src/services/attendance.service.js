import api from './api';

export const attendanceService = {
    markAttendance: async (attendanceData) => {
        // payload: { subjectId, semesterId, date, records: [{studentId, status}] }
        const res = await api.post('/attendance', attendanceData);
        return res.data;
    },

    getStudentAttendance: async (studentId) => {
        const res = await api.get(`/attendance/student/${studentId}`);
        return res.data;
    },

    getSubjectSummary: async (subjectId) => {
        const res = await api.get(`/attendance/subject/${subjectId}/summary`);
        return res.data;
    }
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
