import { Card } from '../components/ui/Card';

const Marks = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Marks Management</h1>
                <p className="text-gray-500 mt-1">Upload and manage internal and external marks for your subjects.</p>
            </div>

            <Card>
                <div className="p-8 pb-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[40vh]">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    <h3 className="text-xl font-bold text-gray-700">Marks Upload Module</h3>
                    <p className="mt-2 text-gray-500 max-w-md">This feature is currently under active development and will be available in the next release.</p>
                </div>
            </Card>
        </div>
    );
};

export default Marks;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
