import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { feeService } from '../services/fee.service';
import { useAuth } from '../context/AuthContext';

const StudentFeeDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Payment Simulation State
    const [paying, setPaying] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [payMessage, setPayMessage] = useState(null); // { type, text }

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await feeService.getStudentFeeDashboard(user.userId || user.id);
            setData(res.data);
            if (res.data.records.length > 0) {
                setPayAmount(res.data.totalBalance || 100);
            }
        } catch (err) {
            setError('Failed to load fee dashboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboard();
        }
    }, [user]);

    const handleSimulatePayment = async (e, recordId) => {
        e.preventDefault();
        setPayMessage(null);
        setPaying(true);
        try {
            await feeService.recordPayment({
                feeRecordId: recordId,
                amount: Number(payAmount),
                mode: 'Credit Card',
                transactionId: 'DEMO-' + Date.now()
            });
            setPayMessage({ type: 'success', text: `Payment of ₹${payAmount} successful!` });
            fetchDashboard(); // Refresh ledger
        } catch (err) {
            setPayMessage({ type: 'error', text: err.response?.data?.error?.message || 'Payment failed.' });
        } finally {
            setPaying(false);
        }
    };

    if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading fee dashboard...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!data) return null;

    const { records, totalBalance, hasOverdue } = data;
    const currentTotalDue = totalBalance;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Fee Dashboard</h1>
                <p className="text-gray-500">View your fee status, upcoming dues, and make payments.</p>
            </div>

            {currentTotalDue > 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md flex items-start">
                    <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div>
                        <h3 className="text-yellow-800 font-bold">Pending Dues</h3>
                        <p className="text-yellow-700 text-sm mt-1">You have an outstanding balance of <span className="font-bold">₹{(currentTotalDue || 0).toLocaleString()}</span>. Please clear your dues.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start">
                    <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <div>
                        <h3 className="text-green-800 font-bold">All Clear</h3>
                        <p className="text-green-700 text-sm mt-1">You have no pending fees at this time.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Amount Due</h3>
                    <p className="text-4xl font-bold mb-1">₹{(totalBalance || 0).toLocaleString()}</p>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <h3 className="text-green-100 text-sm font-semibold uppercase tracking-wider mb-2">Overdue Status</h3>
                    <p className="text-4xl font-bold mb-1">{hasOverdue ? 'Yes' : 'No'}</p>
                </Card>

                {currentTotalDue > 0 && records.length > 0 && records[0].status !== 'Paid' && (
                    <Card className="border-blue-200 bg-blue-50">
                        <h3 className="font-bold text-blue-900 mb-2">Make a Payment</h3>
                        {payMessage && (
                            <div className={`text-xs mb-2 p-1 rounded ${payMessage.type === 'error' ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                                {payMessage.text}
                            </div>
                        )}
                        <form onSubmit={(e) => handleSimulatePayment(e, records[0].feeRecordId)} className="flex gap-2 items-center">
                            <span className="text-gray-500 font-medium">₹</span>
                            <input
                                type="number"
                                max={currentTotalDue}
                                min="1"
                                required
                                value={payAmount}
                                onChange={e => setPayAmount(e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Button type="submit" isLoading={paying} size="sm">Pay</Button>
                        </form>
                    </Card>
                )}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Semester Ledgers</h2>
            {records.length === 0 ? (
                <p className="text-gray-500 italic">No fee records have been assigned yet.</p>
            ) : (
                <div className="space-y-4">
                    {records.map((rec) => {
                        const isFullyPaid = rec.status === 'Paid';
                        const totalRequired = rec.totalDue + rec.fineAccrued;

                        return (
                            <Card key={rec._id} className={isFullyPaid ? 'opacity-75' : 'border-l-4 border-l-blue-500'}>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{rec.structure}</h3>
                                        <p className="text-sm text-gray-500">Due Date: {new Date(rec.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${isFullyPaid ? 'bg-green-100 text-green-700' : rec.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {rec.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <span className="text-xs text-gray-500 font-semibold block">Base Fee</span>
                                        <span className="font-bold text-gray-800">₹{(rec.totalDue || 0).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 font-semibold block">Accumulated Fines</span>
                                        <span className="font-bold text-red-600">₹{(rec.fineAccrued || 0).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 font-semibold block">Total Paid</span>
                                        <span className="font-bold text-green-600">₹{(rec.totalPaid || 0).toLocaleString()}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 font-semibold block">Balance</span>
                                        <span className="font-bold text-gray-800">₹{(rec.balance || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Embedded Payment History */}
                                {rec.payments && rec.payments.length > 0 && (
                                    <div className="bg-gray-50 rounded p-3 text-sm">
                                        <h4 className="font-semibold text-gray-700 mb-2">Payment History</h4>
                                        <ul className="space-y-2">
                                            {rec.payments.map((p, idx) => (
                                                <li key={idx} className="flex justify-between border-b pb-1 last:border-0 last:pb-0 font-mono text-xs">
                                                    <span className="text-gray-500">{new Date(p.date).toLocaleDateString()}</span>
                                                    <span className="text-gray-600">{p.referenceNumber}</span>
                                                    <span className="font-bold text-green-600">+₹{(p.amount || 0).toLocaleString()}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentFeeDashboard;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
