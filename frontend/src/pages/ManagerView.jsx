import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { userService } from '../services/user.service';
import { academicService } from '../services/academic.service';

const ManagerView = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Form Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleName, setRoleName] = useState('Student');

    // Academic Data for Dropdowns
    const [batches, setBatches] = useState([]);
    const [branches, setBranches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [selectedBranchId, setSelectedBranchId] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [userRes, batchRes, branchRes] = await Promise.all([
                    userService.getUsers(),
                    academicService.getAllBatches(),
                    academicService.getAllBranches()
                ]);
                setUsers(userRes.data);
                setBatches(batchRes.data);
                setBranches(branchRes.data);
            } catch (err) {
                console.error("Failed to fetch initial data", err);
                setError('Failed to load users or academic data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [refreshTrigger]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setSubmitting(true);

        try {
            const payload = {
                name,
                email,
                password,
                roleName,
                batchId: selectedBatchId || undefined,
                branchId: selectedBranchId || undefined
            };

            await userService.createUser(payload);
            setSuccessMsg(`${roleName} account for ${name} created successfully!`);

            // Reset form fields
            setName('');
            setEmail('');
            setPassword('');
            setRoleName('Student');
            setSelectedBatchId('');
            setSelectedBranchId('');

            // Trigger table refresh
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            // Note: The backend endpoint is called 'deactivate', but it actually toggles the isActive flag
            await userService.deactivateUser(userId);
            setSuccessMsg(`User status updated successfully.`);
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to update user status');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Staff & Students Management</h1>
                <p className="text-gray-500">Create and oversee teachers, class teachers, and students.</p>
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
                {/* CREATE USER FORM */}
                <Card className="col-span-1 h-fit">
                    <h2 className="text-lg font-semibold mb-4">Create New User</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="e.g. John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="e.g. john@institute.edu"
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

                        <div>
                            <label className="text-sm font-medium text-gray-700">Assign Role</label>
                            <select
                                className="w-full mt-1 border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                required
                            >
                                <option value="Student">Student</option>
                                <option value="Teacher">Teacher</option>
                                <option value="ClassTeacher">Class Teacher</option>
                            </select>
                        </div>

                        {/* Ask for Batch/Branch if applicable */}
                        {['Student', 'ClassTeacher'].includes(roleName) && (
                            <div className="space-y-4 p-3 border border-gray-100 bg-gray-50 rounded-md mt-2">
                                <p className="text-xs text-gray-500 font-medium">Academic Assignment Requirements</p>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Select Batch</label>
                                    <select
                                        className="w-full mt-1 border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                        value={selectedBatchId}
                                        onChange={(e) => setSelectedBatchId(e.target.value)}
                                        required={roleName === 'Student'}
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
                                        required={['Student', 'ClassTeacher'].includes(roleName)}
                                    >
                                        <option value="">-- Choose Branch --</option>
                                        {branches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code || b.name})</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <Button type="submit" isLoading={submitting} className="w-full mt-4">
                            Create User Account
                        </Button>
                    </form>
                </Card>

                {/* USERS TABLE */}
                <Card className="lg:col-span-2 overflow-auto max-h-[700px]">
                    <h2 className="text-lg font-semibold mb-4">Directory</h2>

                    {loading ? (
                        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                        <Table
                            headers={['Name / UID', 'Role', 'Email & Branch', 'Status', 'Action']}
                            data={users}
                            keyExtractor={(u) => u._id}
                            emptyMessage="No users found in this institute."
                            renderRow={(u) => (
                                <>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{u.name}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-1">{u.uid?.split('-')[0]}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${u.role?.name === 'Student' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            u.role?.name === 'Teacher' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                u.role?.name === 'ClassTeacher' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                                    'bg-gray-100 text-gray-700 border-gray-300'
                                            }`}>
                                            {u.role?.name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-800">{u.email}</div>
                                        {u.branch && <div className="text-xs text-gray-500 mt-1">{u.branch?.name} ({u.batch?.startYear})</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            size="sm"
                                            variant={u.isActive ? 'danger' : 'secondary'}
                                            onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                                        >
                                            {u.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                    </td>
                                </>
                            )}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ManagerView;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
