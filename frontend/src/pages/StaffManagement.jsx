import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { userService } from '../services/user.service';
import { academicService } from '../services/academic.service';

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleName, setRoleName] = useState('Teacher');

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
                    userService.getUsers(),
                    academicService.getAllBatches(),
                    academicService.getAllBranches()
                ]);
                // Filter only Teachers and ClassTeachers
                const staffUsers = (userRes.data || []).filter(
                    u => u.role?.name === 'Teacher' || u.role?.name === 'ClassTeacher'
                );
                setStaff(staffUsers);
                setBatches(batchRes.data || []);
                setBranches(branchRes.data || []);
            } catch (err) {
                console.error("Failed to fetch staff data", err);
                setError('Failed to load staff data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [refreshTrigger]);

    const handleCreateStaff = async (e) => {
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
            setSuccessMsg(`${roleName === 'ClassTeacher' ? 'Class Teacher' : 'Teacher'} account for ${name} created!`);

            setName('');
            setEmail('');
            setPassword('');
            setRoleName('Teacher');
            setSelectedBatchId('');
            setSelectedBranchId('');
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create staff member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await userService.deactivateUser(userId);
            setSuccessMsg('Staff status updated successfully.');
            setRefreshTrigger(prev => prev + 1);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to update staff status');
        }
    };

    const headers = ['Name', 'Role', 'Email & Branch', 'Status', 'Actions'];

    const renderRow = (u) => (
        <>
            <td className="px-6 py-4">
                <div className="font-semibold text-gray-900">{u.name}</div>
                <div className="text-xs text-gray-400 font-mono mt-0.5">{u.uid?.split('-')[0]}</div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-bold rounded-full border ${u.role?.name === 'Teacher' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-teal-50 text-teal-700 border-teal-200'
                    }`}>
                    {u.role?.name === 'ClassTeacher' ? 'Class Teacher' : u.role?.name}
                </span>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-800">{u.email}</div>
                {u.branch && <div className="text-xs text-gray-500 mt-1">{u.branch?.name} ({u.batch?.startYear})</div>}
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
                <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-gray-500">Create and manage Teachers and Class Teachers.</p>
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
                {/* CREATE STAFF FORM */}
                <Card className="col-span-1 h-fit">
                    <h2 className="text-lg font-semibold mb-4">Add Staff Member</h2>
                    <form onSubmit={handleCreateStaff} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="e.g. Jane Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="e.g. jane@institute.edu"
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
                                <option value="Teacher">Teacher</option>
                                <option value="ClassTeacher">Class Teacher</option>
                            </select>
                        </div>

                        {/* Batch & Branch required only for ClassTeacher */}
                        {roleName === 'ClassTeacher' && (
                            <div className="space-y-4 p-3 border border-gray-100 bg-gray-50 rounded-md mt-2">
                                <p className="text-xs text-gray-500 font-medium">Academic Assignment</p>
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
                        )}

                        <Button type="submit" isLoading={submitting} className="w-full mt-4">
                            Create Staff Account
                        </Button>
                    </form>
                </Card>

                {/* STAFF TABLE */}
                <Card className="lg:col-span-2 overflow-auto max-h-[700px]">
                    <h2 className="text-lg font-semibold mb-4">
                        Staff Directory
                        <span className="ml-2 text-sm font-normal text-gray-500">({staff.length})</span>
                    </h2>

                    {loading ? (
                        <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
                    ) : (
                        <Table
                            headers={headers}
                            data={staff}
                            keyExtractor={(u) => u._id}
                            emptyMessage="No staff members found. Use the form to add one."
                            renderRow={renderRow}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default StaffManagement;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
