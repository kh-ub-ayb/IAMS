import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { academicService } from '../services/academic.service';
import { useAuth } from '../context/AuthContext';

const BatchManagement = () => {
    const { user } = useAuth();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const res = await academicService.getAllBatches();
            setBatches(res.data);
            setError(null);
        } catch (err) {
            setError('Failed to load batches.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);
        try {
            await academicService.createBatch({
                name,
                startYear: parseInt(startYear),
                endYear: parseInt(endYear)
            });
            setName('');
            setStartYear('');
            setEndYear('');
            fetchBatches(); // Refresh table
        } catch (err) {
            setFormError(err.response?.data?.error?.message || 'Failed to create batch');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteBatch = async (batchId) => {
        if (!window.confirm("Are you sure you want to archive this batch? It will no longer be active.")) return;
        try {
            await academicService.deleteBatch(batchId);
            fetchBatches();
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to archive batch');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
                    <p className="text-gray-500">Manage academic years and batches.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Form (Only for Managers) */}
                {user?.role === 'Manager' && (
                    <Card className="lg:col-span-1 h-fit">
                        <h2 className="text-lg font-semibold mb-4">Create New Batch</h2>
                        {formError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</div>}
                        <form onSubmit={handleCreateBatch} className="space-y-4">
                            <Input
                                label="Batch Name"
                                type="text"
                                placeholder="e.g. B.Tech 2024-2028"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <Input
                                label="Start Year"
                                type="number"
                                placeholder="e.g. 2024"
                                value={startYear}
                                onChange={(e) => setStartYear(e.target.value)}
                                min="2000"
                                max="2100"
                                required
                            />
                            <Input
                                label="End Year"
                                type="number"
                                placeholder="e.g. 2028"
                                value={endYear}
                                onChange={(e) => setEndYear(e.target.value)}
                                min="2000"
                                max="2100"
                                required
                            />
                            <Button type="submit" isLoading={submitting} className="w-full">
                                Create Batch
                            </Button>
                        </form>
                    </Card>
                )}

                {/* Right Col: Table */}
                <Card className={user?.role === 'Manager' ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <h2 className="text-lg font-semibold mb-4">Existing Batches</h2>
                    {error && <div className="text-red-500 mb-4">{error}</div>}

                    {loading ? (
                        <div className="animate-pulse flex flex-col space-y-4">
                            <div className="h-10 bg-gray-200 rounded w-full"></div>
                            <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </div>
                    ) : (
                        <Table
                            headers={user?.role === 'Manager' ? ['ID (UID)', 'Start Year', 'End Year', 'Status', 'Action'] : ['ID (UID)', 'Start Year', 'End Year', 'Status']}
                            data={batches}
                            keyExtractor={(item) => item.uid}
                            emptyMessage="No batches created yet."
                            renderRow={(batch) => (
                                <>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{batch.uid.split('-')[0]}...</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">{batch.startYear}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">{batch.endYear}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Active</span>
                                    </td>
                                    {user?.role === 'Manager' && (
                                        <td className="px-6 py-4">
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteBatch(batch._id)}>
                                                Archive
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

export default BatchManagement;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
