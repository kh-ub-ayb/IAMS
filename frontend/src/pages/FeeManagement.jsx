import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { feeService } from '../services/fee.service';
import { academicService } from '../services/academic.service';

const FeeManagement = () => {
    const [structures, setStructures] = useState([]);
    const [records, setRecords] = useState([]);

    // Form State for new Structure
    const [title, setTitle] = useState('');
    const [branches, setBranches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    const [baseAmount, setBaseAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [finePerDay, setFinePerDay] = useState('50');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    // 1. Initial Load
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [branchRes, structRes, recordRes] = await Promise.all([
                    academicService.getAllBranches(),
                    feeService.getFeeStructures(),
                    feeService.getFeeRecords()
                ]);
                setBranches(branchRes.data);
                setStructures(structRes.data);
                setRecords(recordRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchInitialData();
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
            } catch (err) {
                console.error(err);
            }
        };
        fetchSemesters();
    }, [selectedBranch]);

    const handleCreateStructure = async (e) => {
        e.preventDefault();
        setMessage('');
        setSubmitting(true);
        try {
            // Find the batch ID from the selected semester object
            const currentSemesterObj = semesters.find(s => s._id === selectedSemester);
            const batchId = currentSemesterObj ? currentSemesterObj.batch : null;

            await feeService.createFeeStructure({
                title,
                branchId: selectedBranch,
                semesterId: selectedSemester,
                batchId,
                baseAmount: Number(baseAmount),
                dueDate,
                finePerDay: Number(finePerDay),
                components: [
                    { name: 'Tuition Fee', amount: Number(baseAmount) * 0.8 },
                    { name: 'Development Fee', amount: Number(baseAmount) * 0.2 }
                ] // Hardcoding a basic split for demo purposes
            });
            setMessage('Fee structure created successfully.');
            // Refresh structures
            const structRes = await feeService.getFeeStructures();
            setStructures(structRes.data);
            setTitle('');
            setBaseAmount('');
        } catch (err) {
            setMessage(err.response?.data?.error?.message || 'Failed to create fee structure.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignFees = async (structureId) => {
        setMessage('');
        try {
            const res = await feeService.assignFeeToStudents(structureId);
            setMessage(`Fees assigned to ${res.data.assignedCount} students. ${res.data.skippedCount} skipped.`);
            // Refresh Records
            const recordRes = await feeService.getFeeRecords();
            setRecords(recordRes.data);
        } catch (err) {
            setMessage(err.response?.data?.error?.message || 'Failed to assign fees.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
                    <p className="text-gray-500">Create fee structures and monitor collections.</p>
                </div>
                <Button onClick={async () => {
                    await feeService.refreshFines();
                    const r = await feeService.getFeeRecords();
                    setRecords(r.data);
                    setMessage("Fines recalculated successfully.");
                }} variant="secondary">
                    Refresh Fines (Global)
                </Button>
            </div>

            {message && (
                <div className="p-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CREATE STRUCTURE FORM */}
                <Card className="col-span-1 h-fit">
                    <h2 className="text-lg font-semibold mb-4">Create Fee Structure</h2>
                    <form onSubmit={handleCreateStructure} className="space-y-4">
                        <Input
                            label="Fee Title"
                            placeholder="e.g. Tuition Fee 2024"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                        <div>
                            <label className="text-sm font-medium text-gray-700">Branch</label>
                            <select
                                className="w-full mt-1 border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} required
                            >
                                <option value="">-- Select Branch --</option>
                                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Semester</label>
                            <select
                                className="w-full mt-1 border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                                value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} required disabled={!selectedBranch}
                            >
                                <option value="">-- Select Semester --</option>
                                {semesters.map(s => <option key={s._id} value={s._id}>Semester {s.number}</option>)}
                            </select>
                        </div>
                        <Input label="Base Amount (₹)" type="number" min="0" value={baseAmount} onChange={e => setBaseAmount(e.target.value)} required />
                        <Input label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                        <Input label="Fine Per Day (₹)" type="number" min="0" value={finePerDay} onChange={e => setFinePerDay(e.target.value)} required />
                        <Button type="submit" isLoading={submitting} className="w-full mt-2">Create Blueprint</Button>
                    </form>
                </Card>

                {/* EXISTING STRUCTURES */}
                <Card className="lg:col-span-2 overflow-auto max-h-[500px]">
                    <h2 className="text-lg font-semibold mb-4">Fee Blueprints</h2>
                    <Table
                        headers={['Branch/Sem', 'Amount', 'Due Date', 'Fine/Day', 'Action']}
                        data={structures}
                        keyExtractor={s => s._id}
                        emptyMessage="No fee structures created."
                        renderRow={s => (
                            <>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-800">{s.branch?.name}</div>
                                    <div className="text-xs text-gray-500">Sem {s.semester?.number}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-800">₹{(s.baseAmount || 0).toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{new Date(s.dueDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-red-600 text-sm">₹{s.finePerDay}</td>
                                <td className="px-6 py-4">
                                    <Button size="sm" onClick={() => handleAssignFees(s._id)}>Assign to Students</Button>
                                </td>
                            </>
                        )}
                    />
                </Card>
            </div>

            {/* RECENT FEE RECORDS */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Student Fee Records</h2>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">Showing all assigned records</span>
                </div>
                <Table
                    headers={['Student', 'Branch/Sem', 'Total Due', 'Paid', 'Status']}
                    data={records}
                    keyExtractor={r => r._id}
                    emptyMessage="No students have been assigned fees yet."
                    renderRow={r => (
                        <>
                            <td className="px-6 py-4">
                                <div className="font-semibold text-gray-800">{r.student?.name}</div>
                                <div className="text-xs text-gray-500 font-mono">{r.student?.uid.split('-')[0]}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                                {r.feeStructure?.branch?.code} - Sem {r.feeStructure?.semester?.number}
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-800">₹{((r.feeStructure?.baseAmount || 0) + (r.fineAmount || 0)).toLocaleString()} {r.fineAmount > 0 && <span className="text-xs text-red-500 block">+₹{r.fineAmount} fine</span>}</td>
                            <td className="px-6 py-4 font-semibold text-green-600">₹{(r.amountPaid || 0).toLocaleString()}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${r.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                    r.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {r.status}
                                </span>
                            </td>
                        </>
                    )}
                />
            </Card>

        </div>
    );
};

export default FeeManagement;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
