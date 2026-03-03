import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { academicService } from '../services/academic.service';
import { useAuth } from '../context/AuthContext';

const BranchManagement = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [fullName, setFullName] = useState('');
    const [name, setName] = useState('');
    const [selectedBatch, setSelectedBatch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [batchRes, branchRes] = await Promise.all([
                    academicService.getAllBatches(),
                    academicService.getAllBranches()
                ]);
                setBatches(batchRes.data);
                setBranches(branchRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateBranch = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await academicService.createBranch({
                batchId: selectedBatch,
                name,
                fullName
            });
            // Refresh Branches
            const branchRes = await academicService.getAllBranches();
            setBranches(branchRes.data);
            setFullName('');
            setName('');
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to create branch');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBranch = async (branchId) => {
        if (!window.confirm("Are you sure you want to deactivate this branch?")) return;
        try {
            await academicService.deleteBranch(branchId);
            const branchRes = await academicService.getAllBranches();
            setBranches(branchRes.data);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to deactivate branch');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
                <p className="text-gray-500">Manage academic departments underlying a batch.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {user?.role === 'Manager' && (
                    <Card className="col-span-1 h-fit">
                        <h2 className="text-lg font-semibold mb-4">Create Branch</h2>
                        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

                        <form onSubmit={handleCreateBranch} className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Select Batch</label>
                                <select
                                    className="border border-gray-300 px-3 py-2 rounded-md outline-none bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Batch --</option>
                                    {batches.map(b => (
                                        <option key={b._id} value={b._id}>{b.startYear} - {b.endYear}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Branch Name"
                                placeholder="e.g. Computer Science"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                            <Input
                                label="Branch Code"
                                placeholder="e.g. CSE"
                                value={name}
                                onChange={(e) => setName(e.target.value.toUpperCase())}
                                required
                            />

                            <Button type="submit" isLoading={submitting} className="w-full mt-2">
                                Create & Auto-Generate Semesters
                            </Button>
                        </form>
                    </Card>
                )}

                <Card className={user?.role === 'Manager' ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <h2 className="text-lg font-semibold mb-4">Branches</h2>
                    {loading ? (
                        <div className="text-gray-500">Loading branches...</div>
                    ) : (
                        <Table
                            headers={user?.role === 'Manager' ? ['Code', 'Name', 'Batch', 'Semesters', 'Action'] : ['Code', 'Name', 'Batch', 'Semesters']}
                            data={branches}
                            keyExtractor={(item) => item._id}
                            emptyMessage="No branches found."
                            renderRow={(branch) => (
                                <>
                                    <td className="px-6 py-4 font-bold text-blue-600">{branch.name}</td>
                                    <td className="px-6 py-4">{branch.fullName || branch.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{branch.batch?.startYear}-{branch.batch?.endYear}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full group">
                                            8 Activated
                                        </span>
                                    </td>
                                    {user?.role === 'Manager' && (
                                        <td className="px-6 py-4">
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteBranch(branch._id)}>
                                                Deactivate
                                            </Button>
                                        </td>
                                    )}
                                </>
                            )}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default BranchManagement;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
