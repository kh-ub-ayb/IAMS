import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
                <p className="text-gray-500 mt-1">Manage attendance, marks, and view class performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Mark Attendance</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Record daily attendance for your assigned subjects.</p>
                    <Link to="/attendance/mark" className="text-blue-600 font-medium hover:underline text-sm">Proceed &rarr;</Link>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Upload Marks</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Enter internal and external marks for students.</p>
                    <Link to="/marks" className="text-green-600 font-medium hover:underline text-sm">Proceed &rarr;</Link>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Class Announcements</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Broadcast messages to your specific branch/semester.</p>
                    <Link to="/announcements" className="text-purple-600 font-medium hover:underline text-sm">Proceed &rarr;</Link>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
