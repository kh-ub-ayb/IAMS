import React from 'react';

const StudentResult = () => {
    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-2 text-indigo-900">Academic Results</h2>
            <p className="text-gray-500 mb-8 border-b pb-4">View your semester-wise grades and performance metrics.</p>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md mb-6 flex items-start">
                <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div>
                    <h3 className="text-yellow-800 font-bold">Results Not Published</h3>
                    <p className="text-yellow-700 text-sm mt-1">The examination department has not published results for the current academic session yet. Please check back later.</p>
                </div>
            </div>

            <div className="opacity-50 pointer-events-none">
                <table className="min-w-full divide-y divide-gray-200 mt-4 rounded-lg overflow-hidden border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject Name</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">CS101</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Introduction to Programming</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">4</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-gray-900">-</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">MAT201</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Engineering Mathematics</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">3</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-gray-900">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentResult;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
