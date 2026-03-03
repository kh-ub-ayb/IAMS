import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { academicService } from '../services/academic.service';
import { useAuth } from '../context/AuthContext';

const SubjectManagement = () => {
    const { user } = useAuth();

    // Selection State
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');

    // Data State
    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [credits, setCredits] = useState('4');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // 1. Fetch Branches on mount
    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await academicService.getAllBranches();
                setBranches(res.data);
            } catch (err) {
                setError('Failed to load branches.');
            }
        };
        fetchBranches();
    }, []);

    // 2. Fetch Semesters when Branch changes
    useEffect(() => {
        if (!selectedBranch) {
            setSemesters([]);
            setSelectedSemester('');
            return;
        }
        const fetchSemesters = async () => {
            try {
                const res = await academicService.getSemestersByBranch(selectedBranch);
                setSemesters(res.data.sort((a, b) => a.number - b.number));
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to fetch semesters');
            }
        };
        fetchSemesters();
    }, [selectedBranch]);

    // 3. Fetch Subjects when Semester changes
    const fetchSubjects = async () => {
        if (!selectedSemester) {
            setSubjects([]);
            return;
        }
        try {
            setLoadingSubjects(true);
            const res = await academicService.getSubjectsBySemester(selectedSemester);
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSubjects(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSemester]);


    const handleCreateSubject = async (e) => {
        e.preventDefault();
        if (!selectedSemester) return setError("Please select a semester first.");

        setError(null);
        setSubmitting(true);

        try {
            await academicService.createSubject(selectedSemester, {
                name,
                code,
                credits: parseInt(credits)
            });
            // Reset form and refresh
            setName('');
            setCode('');
            setCredits('4');
            fetchSubjects();
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create subject');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteSubject = async (subjectId) => {
        if (!window.confirm("Are you sure you want to prevent further updates to this subject?")) return;
        try {
            await academicService.deleteSubject(subjectId);
            fetchSubjects();
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to deactivate subject');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
                <p className="text-gray-500">Assign subjects to specific semesters within a branch.</p>
            </div>

            {/* Global Filter Bar */}
            <Card className="flex flex-col sm:flex-row gap-4 bg-gray-50 border-gray-200">
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Filter by Branch</label>
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
                <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Filter by Semester</label>
                    <select
                        className="w-full border border-gray-300 px-3 py-2 rounded outline-none shadow-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        disabled={!selectedBranch}
                    >
                        <option value="">-- Choose Semester --</option>
                        {semesters.map(s => (
                            <option key={s._id} value={s._id}>
                                Semester {s.number} {s.isActive ? '(Active)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </Card>

            {selectedSemester && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Create Form (Manager/ClassTeacher) */}
                    {(user?.role === 'Manager' || user?.role === 'ClassTeacher') && (
                        <Card className="col-span-1 h-fit">
                            <h2 className="text-lg font-semibold mb-4">Add New Subject</h2>
                            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

                            <form onSubmit={handleCreateSubject} className="space-y-4">
                                <Input
                                    label="Subject Name"
                                    placeholder="e.g. Data Structures"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Subject Code"
                                    placeholder="e.g. CS201"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    required
                                />
                                <Input
                                    label="Credits"
                                    type="number"
                                    min="1"
                                    max="6"
                                    value={credits}
                                    onChange={(e) => setCredits(e.target.value)}
                                    required
                                />
                                <Button type="submit" isLoading={submitting} className="w-full mt-2">
                                    Create Subject
                                </Button>
                            </form>
                        </Card>
                    )}

                    {/* Subjects Table */}
                    <Card className={(user?.role === 'Manager' || user?.role === 'ClassTeacher') ? 'lg:col-span-2' : 'lg:col-span-3'}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Subjects for Selected Semester</h2>
                            <span className="text-sm bg-blue-100 text-blue-800 font-semibold px-2 py-1 rounded">Total: {subjects.length}</span>
                        </div>

                        {loadingSubjects ? (
                            <div className="text-gray-500">Loading subjects...</div>
                        ) : (
                            <Table
                                headers={['Code', 'Name', 'Credits', 'Status', 'Action']}
                                data={subjects}
                                keyExtractor={(item) => item._id}
                                emptyMessage="No subjects have been assigned to this semester yet."
                                renderRow={(subject) => (
                                    <>
                                        <td className="px-6 py-4 font-mono font-bold text-gray-700">{subject.code}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{subject.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{subject.credits}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${subject.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {subject.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {(user?.role === 'Manager' || user?.role === 'ClassTeacher') && subject.isActive && (
                                                <Button size="sm" variant="danger" onClick={() => handleDeleteSubject(subject._id)}>
                                                    Deactivate
                                                </Button>
                                            )}
                                        </td>
                                    </>
                                )}
                            />
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SubjectManagement;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
