export const Table = ({ headers, data, keyExtractor, renderRow, emptyMessage = "No records found." }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <tr>
                        {headers.map((h, i) => (
                            <th key={i} className="px-6 py-3 font-semibold">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={headers.length} className="px-6 py-8 text-center text-gray-500 italic">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, index) => (
                            <tr key={keyExtractor(row, index)} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                {renderRow(row, index)}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
