import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { userService } from '../services/user.service';
import { academicService } from '../services/academic.service';
import { useAuth } from '../context/AuthContext';

const ClassStudents = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [selectedSemesterId, setSelectedSemesterId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Track which subject is being assigned
    const [assigningSubjectId, setAssigningSubjectId] = useState(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');

    // Load branches and teachers
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [userRes, branchRes] = await Promise.all([
                    userService.getUsers(),
                    academicService.getAllBranches()
                ]);
                const teacherUsers = (userRes.data || []).filter(
                    u => u.role?.name === 'Teacher' || u.role?.name === 'ClassTeacher'
                );
                setTeachers(teacherUsers);
                setBranches(branchRes.data || []);

                // Auto-select user's branch if available from JWT
                if (user?.branch) {
                    setSelectedBranchId(user.branch);
                }
            } catch (err) {
                console.error('Failed to fetch data', err);
                setError('Failed to load initial data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [user]);

    // Load semesters when branch changes
    useEffect(() => {
        if (!selectedBranchId) {
            setSemesters([]);
            setSelectedSemesterId('');
            return;
        }
        const fetchSemesters = async () => {
            try {
                const semRes = await academicService.getSemestersByBranch(selectedBranchId);
                setSemesters(semRes.data || []);
                const activeSem = (semRes.data || []).find(s => s.isActive);
                if (activeSem) {
                    setSelectedSemesterId(activeSem._id);
                } else {
                    setSelectedSemesterId('');
                }
            } catch (err) {
                console.error('Failed to fetch semesters', err);
            }
        };
        fetchSemesters();
    }, [selectedBranchId]);

    // Load subjects when semester changes
    useEffect(() => {
        if (!selectedSemesterId) {
            setSubjects([]);
            return;
        }
        const fetchSubjects = async () => {
            try {
                const res = await academicService.getSubjectsBySemester(selectedSemesterId);
                setSubjects(res.data || []);
            } catch (err) {
                console.error('Failed to fetch subjects', err);
                setError('Failed to load subjects.');
            }
        };
        fetchSubjects();
    }, [selectedSemesterId]);

    const handleAssignTeacher = async (subjectId) => {
        setError('');
        setSuccessMsg('');
        try {
            await academicService.assignTeacher(subjectId, selectedTeacherId || null);
            setSuccessMsg('Teacher assigned successfully!');
            setAssigningSubjectId(null);
            setSelectedTeacherId('');
            const res = await academicService.getSubjectsBySemester(selectedSemesterId);
            setSubjects(res.data || []);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to assign teacher');
        }
    };

    const handleRemoveTeacher = async (subjectId) => {
        setError('');
        setSuccessMsg('');
        try {
            await academicService.assignTeacher(subjectId, null);
            setSuccessMsg('Teacher removed from subject.');
            const res = await academicService.getSubjectsBySemester(selectedSemesterId);
            setSubjects(res.data || []);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to remove teacher');
        }
    };

    const headers = ['Subject', 'Code', 'Credits', 'Assigned Teacher', 'Actions'];

    const renderRow = (sub) => (
        <>
            <td className="px-6 py-4 font-semibold text-gray-900">{sub.name}</td>
            <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-mono bg-gray-100 rounded">{sub.code}</span>
            </td>
            <td className="px-6 py-4 text-center text-gray-600">{sub.credits || 0}</td>
            <td className="px-6 py-4">
                {assigningSubjectId === sub._id ? (
                    <div className="flex items-center gap-2">
                        <select
                            className="border border-gray-300 px-2 py-1.5 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[160px]"
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                        >
                            <option value="">-- Select Teacher --</option>
                            {teachers.map(t => (
                                <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                            ))}
                        </select>
                        <Button onClick={() => handleAssignTeacher(sub._id)}>Save</Button>
                        <Button variant="outline" onClick={() => { setAssigningSubjectId(null); setSelectedTeacherId(''); }}>Cancel</Button>
                    </div>
                ) : sub.teacher ? (
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
                            {sub.teacher.name}
                        </span>
                        <span className="text-xs text-gray-400">{sub.teacher.email}</span>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 italic">Not assigned</span>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="flex gap-2">
                    {assigningSubjectId !== sub._id && (
                        <Button
                            variant="primary"
                            onClick={() => {
                                setAssigningSubjectId(sub._id);
                                setSelectedTeacherId(sub.teacher?._id || '');
                            }}
                        >
                            {sub.teacher ? 'Change' : 'Assign'}
                        </Button>
                    )}
                    {sub.teacher && assigningSubjectId !== sub._id && (
                        <Button
                            variant="danger"
                            onClick={() => handleRemoveTeacher(sub._id)}
                        >
                            Remove
                        </Button>
                    )}
                </div>
            </td>
        </>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
                <p className="text-gray-500">Assign teachers to subjects in your branch.</p>
            </div>

            {successMsg && (
                <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md">
                    {successMsg}
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
                    {error}
                </div>
            )}

            {/* Branch & Semester selectors */}
            <Card>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Branch:</label>
                        <select
                            className="border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[180px]"
                            value={selectedBranchId}
                            onChange={(e) => setSelectedBranchId(e.target.value)}
                        >
                            <option value="">-- Select Branch --</option>
                            {branches.map(b => (
                                <option key={b._id} value={b._id}>
                                    {b.name} {b.batch ? `(${b.batch.startYear}-${b.batch.endYear})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedBranchId && (
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Semester:</label>
                            <select
                                className="border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[200px]"
                                value={selectedSemesterId}
                                onChange={(e) => setSelectedSemesterId(e.target.value)}
                            >
                                <option value="">-- Choose Semester --</option>
                                {semesters.map(s => (
                                    <option key={s._id} value={s._id}>
                                        Semester {s.number} {s.isActive ? '(Active)' : s.isCompleted ? '(Completed)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </Card>

            {/* Subject Table with Teacher Assignment */}
            {selectedSemesterId && (
                <Card className="overflow-auto">
                    <h2 className="text-lg font-semibold mb-4">
                        Subjects & Teacher Assignments
                        <span className="ml-2 text-sm font-normal text-gray-500">({subjects.length} subjects)</span>
                    </h2>
                    <Table
                        headers={headers}
                        data={subjects}
                        keyExtractor={(s) => s._id}
                        emptyMessage="No subjects found in this semester. Ask a Manager to create subjects first."
                        renderRow={renderRow}
                    />
                </Card>
            )}

            {!selectedBranchId && !loading && (
                <Card>
                    <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-medium">Select a branch to manage teacher assignments</p>
                        <p className="text-sm mt-1">Choose a branch and semester from the dropdowns above.</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ClassStudents;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
