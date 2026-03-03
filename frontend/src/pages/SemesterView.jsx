import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { academicService } from '../services/academic.service';

const SemesterView = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await academicService.getAllBranches();
                setBranches(res.data);
                if (res.data.length > 0) {
                    setSelectedBranch(res.data[0]._id);
                }
            } catch (err) {
                setError('Failed to load branches for selection.');
            }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        if (!selectedBranch) return;

        const fetchSemesters = async () => {
            try {
                setLoading(true);
                const res = await academicService.getSemestersByBranch(selectedBranch);
                setSemesters(res.data);
                setError(null);
            } catch (err) {
                setError('Failed to load semesters.');
            } finally {
                setLoading(false);
            }
        };

        fetchSemesters();
    }, [selectedBranch]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Semesters Overview</h1>
                    <p className="text-gray-500">View auto-generated semesters for a specific branch.</p>
                </div>

                <div className="w-full sm:w-auto">
                    <select
                        className="w-full sm:w-64 border border-gray-300 px-3 py-2 rounded-md outline-none bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 shadow-sm"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                        {branches.map(b => (
                            <option key={b._id} value={b._id}>
                                {b.name} ({b.batch?.startYear}-{b.batch?.endYear})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <Card>
                {error && <div className="text-red-500 mb-4">{error}</div>}

                {loading ? (
                    <div className="text-gray-500">Loading semesters...</div>
                ) : (
                    <Table
                        headers={['Semester', 'Status', 'Generated Valid Dates']}
                        data={semesters.sort((a, b) => a.number - b.number)}
                        keyExtractor={(item) => item._id}
                        emptyMessage="No semesters found for this branch."
                        renderRow={(sem) => (
                            <>
                                <td className="px-6 py-4 font-bold text-gray-800">Semester {sem.number}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sem.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {sem.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(sem.startDate).toLocaleDateString()} &rarr; {new Date(sem.endDate).toLocaleDateString()}
                                </td>
                            </>
                        )}
                    />
                )}
            </Card>

            <div className="bg-blue-50 text-blue-800 p-4 rounded border border-blue-200 text-sm">
                <strong>Note:</strong> Semesters are automatically generated upon Branch creation. Only the 1st semester is active by default. Use the Promotion Engine to activate subsequent semesters.
            </div>
        </div>
    );
};

export default SemesterView;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
