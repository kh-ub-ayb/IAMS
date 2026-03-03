const StudentView = () => {
    return (
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Student Dashboard</h2>
            <p className="text-gray-600">This page is protected. Only users with the <span className="font-semibold text-gray-800">Student</span> role can view this content.</p>
        </div>
    );
};

export default StudentView;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
