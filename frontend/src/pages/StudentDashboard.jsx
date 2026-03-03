import { useState, useEffect } from 'react';
import { announcementService } from '../services/announcement.service';

const StudentDashboard = () => {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        announcementService.getStudentAnnouncements()
            .then(res => setAnnouncements(res.data.slice(0, 3))) // get top 3 latest
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold">Welcome Back! ✨</h1>
                <p className="mt-2 text-blue-100">Here's your academic summary.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Attendance Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                    <div className="relative w-24 h-24 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                className="text-gray-200 stroke-current text-gray-200"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-green-500 stroke-current"
                                strokeWidth="3"
                                strokeDasharray="85, 100"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-800">85%</span>
                        </div>
                    </div>
                    <h3 className="font-semibold text-gray-800">Overall Attendance</h3>
                    <p className="text-sm text-gray-500 mt-1">You are above the 75% threshold. Keep it up!</p>
                </div>

                {/* Live Announcements Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                    <h3 className="font-semibold text-gray-800 mb-4">Recent Announcements</h3>
                    <div className="space-y-4">
                        {announcements.length === 0 ? (
                            <p className="text-gray-500 italic text-sm border-l-4 border-l-gray-300 pl-3">No new announcements at this time.</p>
                        ) : (
                            announcements.map(ann => (
                                <div key={ann._id} className="border-l-4 border-l-blue-500 pl-3 py-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-bold text-sm text-gray-800">{ann.title}</p>
                                        <span className="text-xs text-gray-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">{ann.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
