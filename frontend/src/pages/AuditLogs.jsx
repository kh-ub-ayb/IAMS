import { Card } from '../components/ui/Card';

const AuditLogs = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">System Audit Logs</h1>
                <p className="text-gray-500 mt-1">Immutable record of critical system actions.</p>
            </div>

            <Card>
                <div className="p-8 pb-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[40vh]">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                    <h3 className="text-xl font-bold text-gray-700">Audit Trail Viewer</h3>
                    <p className="mt-2 text-gray-500 max-w-md">The audit log viewer UI is currently being finalized. Backend tracking is actively running.</p>
                </div>
            </Card>
        </div>
    );
};

export default AuditLogs;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
