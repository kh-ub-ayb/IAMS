const SuperAdminDashboard = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
                <p className="text-gray-500 mt-1">Global platform metrics and controls.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-purple-600">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Institutions</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">1</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-blue-600">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Managers</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">4</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-green-600">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">System Health</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">Optimal</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Audit Logs</h2>
                <div className="text-gray-500 text-sm italic">Audit log datatable will render here...</div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
