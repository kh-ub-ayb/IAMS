const TeacherView = () => {
    return (
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
            <h2 className="text-2xl font-bold mb-4 text-green-700">Teacher Dashboard</h2>
            <p className="text-gray-600">This page is protected. Only users with the <span className="font-semibold text-gray-800">Teacher</span> or <span className="font-semibold text-gray-800">ClassTeacher</span> role can view this content.</p>
        </div>
    );
};

export default TeacherView;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
