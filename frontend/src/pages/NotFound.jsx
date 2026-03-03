import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
            <p className="text-gray-500 mb-6">The page you are looking for does not exist or has been moved.</p>
            <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition transition-colors">
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFound;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
