import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center">
                {/* Mobile menu button could go here */}
                <h2 className="text-xl font-bold text-gray-800 lg:hidden">IAMS</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button
                    onClick={logout}
                    className="ml-4 text-sm text-red-600 font-medium hover:text-red-800 transition"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
