import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar fixed on the left */}
            <Sidebar />

            {/* Main content wrapper, offset by sidebar width on large screens */}
            <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
                {/* Header */}
                <Header />

                {/* Global Toaster for Notifications */}
                <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 pb-20 md:pb-8 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
