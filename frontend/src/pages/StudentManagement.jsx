import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { userService } from '../services/user.service';
import { academicService } from '../services/academic.service';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Academic Data
    const [batches, setBatches] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedBranchId, setSelectedBranchId] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [userRes, batchRes, branchRes] = await Promise.all([
                    userService.getUsers({ roleName: 'Student' }),
                    academicService.getAllBatches(),
                    academicService.getAllBranches()
                ]);
                const studentUsers = (userRes.data || []).filter(u => u.role?.name === 'Student');
                setStudents(studentUsers);
                setBatches(batchRes.data || []);
                setBranches(branchRes.data || []);
            } catch (err) {
                console.error("Failed to fetch student data", err);
                setError('Failed to load student data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger]);

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setSubmitting(true);

        try {
            const payload = {
                name,
                email,
                password,
                roleName: 'Student',
                batchId: selectedBatchId || undefined,
                branchId: selectedBranchId || undefined
            };

            await userService.createUser(payload);
            setSuccessMsg(`Student account for ${name} created successfully!`);

            setName('');
            setEmail('');
            setPassword('');
            setSelectedBatchId('');
            setSelectedBranchId('');
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create student');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await userService.deactivateUser(userId);
            setSuccessMsg('Student status updated successfully.');
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to update student status');
        }
    };

    const headers = ['Name', 'Email', 'Batch / Branch', 'Status', 'Actions'];

    const renderRow = (u) => (
        <>
            <td className="px-6 py-4">
                <div className="font-semibold text-gray-900">{u.name}</div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">{u.uid?.split('-')[0]}</div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
            <td className="px-6 py-4">
                {u.batch ? (
                    <div>
                        <span className="text-sm font-medium text-gray-800">{u.branch?.name || '—'}</span>
                        <span className="text-xs text-gray-500 ml-1">({u.batch?.startYear} – {u.batch?.endYear})</span>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 italic">Not assigned</span>
                )}
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive !== false ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td className="px-6 py-4">
                <Button
                    variant={u.isActive !== false ? 'danger' : 'secondary'}
                    onClick={() => handleToggleStatus(u._id)}
                >
                    {u.isActive !== false ? 'Deactivate' : 'Activate'}
                </Button>
            </td>
        </>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                <p className="text-gray-500">Enroll and manage student accounts.</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CREATE STUDENT FORM */}
                <Card className="col-span-1 h-fit">
                    <h2 className="text-lg font-semibold mb-4">Enroll New Student</h2>
                    <form onSubmit={handleCreateStudent} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="e.g. Charlie Student"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="e.g. charlie@institute.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            label="Temporary Password"
                            type="text"
                            placeholder="e.g. Pass@123"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <div className="space-y-4 p-3 border border-gray-100 bg-gray-50 rounded-md mt-2">
                            <p className="text-xs text-gray-500 font-medium">Academic Assignment (Required)</p>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Select Batch</label>
                                <select
                                    className="w-full mt-1 border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={selectedBatchId}
                                    onChange={(e) => setSelectedBatchId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Batch --</option>
                                    {batches.map(b => <option key={b._id} value={b._id}>{b.startYear} - {b.endYear}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Select Branch</label>
                                <select
                                    className="w-full mt-1 border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={selectedBranchId}
                                    onChange={(e) => setSelectedBranchId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Branch --</option>
                                    {branches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code || b.name})</option>)}
                                </select>
                            </div>
                        </div>

                        <Button type="submit" isLoading={submitting} className="w-full mt-4">
                            Enroll Student
                        </Button>
                    </form>
                </Card>

                {/* STUDENTS TABLE */}
                <Card className="lg:col-span-2 overflow-auto max-h-[700px]">
                    <h2 className="text-lg font-semibold mb-4">
                        Student Directory
                        <span className="ml-2 text-sm font-normal text-gray-500">({students.length})</span>
                    </h2>

                    {loading ? (
                        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                        <Table
                            headers={headers}
                            data={students}
                            keyExtractor={(u) => u._id}
                            emptyMessage="No students enrolled yet. Use the form to add one."
                            renderRow={renderRow}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default StudentManagement;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
