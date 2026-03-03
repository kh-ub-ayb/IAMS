import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { attendanceService } from '../services/attendance.service';
import { useAuth } from '../context/AuthContext';

const StudentAttendance = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await attendanceService.getStudentAttendance(user.userId || user.id); // depending on jwt structure
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.error?.message || 'Failed to load attendance.');
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchAttendance();
        }
    }, [user]);

    if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading attendance dashboard...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!data) return null;

    const { overall, subjects } = data;
    const { percentage: overallPercentage, atRisk, totalClasses, totalPresent: presentClasses } = overall;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
                <p className="text-gray-500">View overall and subject-wise attendance statistics.</p>
            </div>

            {atRisk && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                    <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    <div>
                        <h3 className="text-red-800 font-bold">Attendance Warning</h3>
                        <p className="text-red-700 text-sm mt-1">Your overall attendance is below the mandatory 75% threshold. Please ensure regular attendance to avoid academic penalties.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={`col-span-1 border-t-4 flex flex-col items-center justify-center text-center py-8 ${atRisk ? 'border-t-red-500' : 'border-t-green-500'}`}>
                    <div className="relative w-32 h-32 mb-4">
                        {/* Simple SVG Circular Progress */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-gray-100 stroke-current text-gray-200"
                                strokeWidth="3.5"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className={`${atRisk ? 'text-red-500' : 'text-green-500'} stroke-current transition-all duration-1000 ease-out`}
                                strokeWidth="3.5"
                                strokeDasharray={`${overallPercentage}, 100`}
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className={`text-3xl font-bold ${atRisk ? 'text-red-600' : 'text-green-600'}`}>
                                {overallPercentage.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-lg">Overall Attendance</h3>
                </Card>

                <Card className="col-span-1 md:col-span-2">
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="bg-gray-50 rounded-lg p-6 flex flex-col justify-center">
                            <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Classes Held</span>
                            <span className="text-4xl font-bold text-gray-800">{totalClasses}</span>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-6 flex flex-col justify-center">
                            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2">Classes Attended</span>
                            <span className="text-4xl font-bold text-blue-800">{presentClasses}</span>
                        </div>
                    </div>
                </Card>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">Subject-wise Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((sub) => (
                    <Card key={sub.subjectId} className="hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-gray-800 mb-1">{sub.subjectName}</h3>
                        <p className="text-xs text-gray-500 font-mono mb-4">{sub.subjectCode}</p>

                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <span className="text-sm font-semibold text-gray-600">{sub.attended}/{sub.totalClasses}</span>
                                <span className="text-xs text-gray-400 ml-1">classes</span>
                            </div>
                            <span className={`text-lg font-bold ${sub.percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                                {sub.percentage.toFixed(1)}%
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${sub.percentage < 75 ? 'bg-red-500' : 'bg-green-500'}`}
                                style={{ width: `${sub.percentage}%` }}
                            ></div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default StudentAttendance;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
