import { Card } from '../components/ui/Card';

const Institutions = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Institutions Management</h1>
                <p className="text-gray-500 mt-1">Manage institutions on the IAMS platform.</p>
            </div>

            <Card>
                <div className="p-8 pb-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[40vh]">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    <h3 className="text-xl font-bold text-gray-700">Institution Registry</h3>
                    <p className="mt-2 text-gray-500 max-w-md">Multi-tenant institution management is currently under development. You currently have 1 active institution registered in the system.</p>
                </div>
            </Card>
        </div>
    );
};

export default Institutions;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
