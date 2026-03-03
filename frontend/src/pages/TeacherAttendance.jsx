import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { academicService } from '../services/academic.service';
import { userService } from '../services/user.service';
import { attendanceService } from '../services/attendance.service';

const TeacherAttendance = () => {
    // Cascading Selection State
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');

    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');

    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Data State
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'Present' | 'Absent' | 'Late' }
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' }); // type: 'error' | 'success'

    // 1. Fetch Branches
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await academicService.getAllBranches();
                setBranches(res.data);
            } catch (err) {
                console.error("Failed to load branches", err);
            }
        };
        fetchBranches();
    }, []);

    // 2. Fetch Semesters & Students when Branch changes
    useEffect(() => {
        if (!selectedBranch) {
            setSemesters([]);
            setSelectedSemester('');
            setStudents([]);
            return;
        }
        const fetchSemestersAndStudents = async () => {
            try {
                setLoading(true);
                const [semRes, stuRes] = await Promise.all([
                    academicService.getSemestersByBranch(selectedBranch),
                    userService.getUsers({ roleName: 'Student' })
                ]);
                setSemesters(semRes.data.sort((a, b) => a.number - b.number));

                // Filter students belonging to this branch locally if the API returned all accessible students
                // user.branch._id or user.branch depending on population
                const branchStudents = stuRes.data.filter(s => {
                    const sBId = typeof s.branch === 'object' ? s.branch?._id : s.branch;
                    return sBId === selectedBranch;
                });
                setStudents(branchStudents);

                // Initialize default attendance to Present
                const initialStatus = {};
                branchStudents.forEach(stu => {
                    initialStatus[stu._id] = 'Present';
                });
                setAttendanceData(initialStatus);

            } catch (err) {
                console.error("Failed to load semesters or students", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSemestersAndStudents();
    }, [selectedBranch]);

    // 3. Fetch Subjects when Semester changes
    useEffect(() => {
        if (!selectedSemester) {
            setSubjects([]);
            setSelectedSubject('');
            return;
        }
        const fetchSubjects = async () => {
            try {
                const res = await academicService.getSubjectsBySemester(selectedSemester);
                setSubjects(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSubjects();
    }, [selectedSemester]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleMarkAll = (status) => {
        const updated = {};
        students.forEach(stu => updated[stu._id] = status);
        setAttendanceData(updated);
    };

    const handleSubmit = async () => {
        setMessage({ type: '', text: '' });
        if (!selectedSubject || !selectedSemester || !date) {
            setMessage({ type: 'error', text: 'Subject, Semester, and Date are required.' });
            return;
        }
        if (students.length === 0) {
            setMessage({ type: 'error', text: 'No students found for this branch.' });
            return;
        }

        setSubmitting(true);
        try {
            const records = Object.keys(attendanceData).map(studentId => ({
                studentId,
                status: attendanceData[studentId]
            }));

            const payload = {
                subjectId: selectedSubject,
                semesterId: selectedSemester,
                date,
                records
            };

            const res = await attendanceService.markAttendance(payload);
            setMessage({ type: 'success', text: `Attendance saved: ${res.data.markedCount} marked, ${res.data.skippedCount} skipped (already existed).` });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error?.message || 'Failed to submit attendance.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
                <p className="text-gray-500">Record daily attendance for your classes.</p>
            </div>

            <Card className="bg-gray-50 border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Branch</label>
                        <select
                            className="w-full border border-gray-300 px-3 py-2 rounded outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                        >
                            <option value="">-- Choose Branch --</option>
                            {branches.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Semester</label>
                        <select
                            className="w-full border border-gray-300 px-3 py-2 rounded outline-none shadow-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            disabled={!selectedBranch}
                        >
                            <option value="">-- Choose Semester --</option>
                            {semesters.map(s => (
                                <option key={s._id} value={s._id}>Sem {s.number} {s.isActive ? '(Active)' : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                        <select
                            className="w-full border border-gray-300 px-3 py-2 rounded outline-none shadow-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={!selectedSemester}
                        >
                            <option value="">-- Choose Subject --</option>
                            {subjects.map(s => (
                                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Input
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </Card>

            {message.text && (
                <div className={`p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                    {message.text}
                </div>
            )}

            {selectedBranch && selectedSemester && selectedSubject && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Student List ({students.length})</h2>
                        <div className="flex gap-2">
                            <button onClick={() => handleMarkAll('Present')} className="text-sm font-medium text-green-600 hover:bg-green-50 px-2 py-1 rounded transition">Mark All Present</button>
                            <button onClick={() => handleMarkAll('Absent')} className="text-sm font-medium text-red-600 hover:bg-red-50 px-2 py-1 rounded transition">Mark All Absent</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-gray-500">Loading students...</div>
                    ) : (
                        <div className="space-y-4">
                            <Table
                                headers={['UID', 'Name', 'Status']}
                                data={students}
                                keyExtractor={(stu) => stu._id}
                                emptyMessage="No students found for this branch."
                                renderRow={(stu) => (
                                    <>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{stu.uid.split('-')[0]}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{stu.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-1 cursor-pointer">
                                                    <input type="radio"
                                                        name={`status-${stu._id}`}
                                                        value="Present"
                                                        checked={attendanceData[stu._id] === 'Present'}
                                                        onChange={() => handleStatusChange(stu._id, 'Present')}
                                                        className="text-green-600 focus:ring-green-500"
                                                    />
                                                    <span className={attendanceData[stu._id] === 'Present' ? 'text-green-700 font-semibold' : 'text-gray-600'}>Present</span>
                                                </label>
                                                <label className="flex items-center gap-1 cursor-pointer">
                                                    <input type="radio"
                                                        name={`status-${stu._id}`}
                                                        value="Absent"
                                                        checked={attendanceData[stu._id] === 'Absent'}
                                                        onChange={() => handleStatusChange(stu._id, 'Absent')}
                                                        className="text-red-600 focus:ring-red-500"
                                                    />
                                                    <span className={attendanceData[stu._id] === 'Absent' ? 'text-red-700 font-semibold' : 'text-gray-600'}>Absent</span>
                                                </label>
                                                <label className="flex items-center gap-1 cursor-pointer">
                                                    <input type="radio"
                                                        name={`status-${stu._id}`}
                                                        value="Late"
                                                        checked={attendanceData[stu._id] === 'Late'}
                                                        onChange={() => handleStatusChange(stu._id, 'Late')}
                                                        className="text-yellow-600 focus:ring-yellow-500"
                                                    />
                                                    <span className={attendanceData[stu._id] === 'Late' ? 'text-yellow-700 font-semibold' : 'text-gray-600'}>Late</span>
                                                </label>
                                            </div>
                                        </td>
                                    </>
                                )}
                            />

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button onClick={handleSubmit} isLoading={submitting}>
                                    Save Attendance
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default TeacherAttendance;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
