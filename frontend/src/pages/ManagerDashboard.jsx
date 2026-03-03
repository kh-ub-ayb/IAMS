import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { announcementService } from '../services/announcement.service';
const ManagerDashboard = () => {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        announcementService.getAnnouncements({ limit: 4 })
            .then(res => setAnnouncements(res.data.slice(0, 4)))
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Institute Overview</h1>
                <p className="text-gray-500 mt-1">Manage academics, staff, students, and finances.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-600">
                    <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">1,204</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-600">
                    <h3 className="text-gray-500 text-sm font-medium">Total Teachers</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">45</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-600">
                    <h3 className="text-gray-500 text-sm font-medium">Fee Collection</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">₹12.5M</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-600">
                    <h3 className="text-gray-500 text-sm font-medium">Active Batches</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">8</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-[300px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Recent Announcements</h2>
                        <Link to="/announcements" className="text-sm text-blue-600 hover:underline">View All / Create</Link>
                    </div>
                    <div className="overflow-y-auto pr-2 space-y-3 flex-grow">
                        {announcements.length === 0 ? (
                            <p className="text-gray-500 italic text-sm">No recent broadcasts.</p>
                        ) : (
                            announcements.map(ann => (
                                <div key={ann._id} className="border-b border-gray-100 pb-2 last:border-0">
                                    <div className="flex justify-between">
                                        <p className="font-bold text-sm text-gray-800">{ann.title}</p>
                                        <span className="text-xs text-gray-400">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{ann.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Academic Quick Links</h2>
                    <div className="flex flex-wrap gap-4">
                        <Link to="/academics/batches" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md font-medium text-sm hover:bg-indigo-100 transition inline-block">Manage Batches</Link>
                        <Link to="/manager/staff" className="px-4 py-2 bg-purple-50 text-purple-700 rounded-md font-medium text-sm hover:bg-purple-100 transition inline-block">Manage Staff</Link>
                        <Link to="/manager/students" className="px-4 py-2 bg-teal-50 text-teal-700 rounded-md font-medium text-sm hover:bg-teal-100 transition inline-block">Manage Students</Link>
                        <Link to="/fees/manage" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md font-medium text-sm hover:bg-blue-100 transition inline-block">Assign Fees</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
