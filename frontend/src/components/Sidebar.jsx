import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Define navigation links based on role
    const getNavLinks = () => {
        const role = user?.role;

        const links = [
            { name: 'Dashboard', path: '/dashboard', roles: ['SuperAdmin', 'Manager', 'ClassTeacher', 'Teacher', 'Student'] },
        ];

        if (role === 'SuperAdmin') {
            links.push(
                { name: 'Institutions', path: '/institutions', roles: ['SuperAdmin'] },
                { name: 'Managers', path: '/managers', roles: ['SuperAdmin'] },
                { name: 'Audit Logs', path: '/audit', roles: ['SuperAdmin'] }
            );
        }

        if (role === 'Manager') {
            links.push(
                { name: 'Batches', path: '/academics/batches', roles: ['Manager'] },
                { name: 'Branches', path: '/academics/branches', roles: ['Manager'] },
                { name: 'Semesters', path: '/academics/semesters', roles: ['Manager'] },
                { name: 'Subjects', path: '/academics/subjects', roles: ['Manager'] },
                { name: 'Staff', path: '/manager/staff', roles: ['Manager'] },
                { name: 'Students', path: '/manager/students', roles: ['Manager'] },
                { name: 'Fees Management', path: '/fees/manage', roles: ['Manager'] },
                { name: 'Announcements', path: '/announcements', roles: ['Manager'] }
            );
        }

        if (role === 'ClassTeacher' || role === 'Teacher') {
            links.push(
                { name: 'My Classes', path: '/classes', roles: ['ClassTeacher', 'Teacher'] },
                { name: 'Mark Attendance', path: '/attendance/mark', roles: ['ClassTeacher', 'Teacher'] },
                { name: 'Marks', path: '/marks', roles: ['ClassTeacher', 'Teacher'] }
            );
            if (role === 'ClassTeacher') {
                links.push({ name: 'Class Students', path: '/class-students', roles: ['ClassTeacher'] });
                links.push({ name: 'Announcements', path: '/announcements', roles: ['ClassTeacher'] });
            }
        }

        if (role === 'Student') {
            links.push(
                { name: 'My Dashboard', path: '/student/academics', roles: ['Student'] },
                { name: 'Attendance', path: '/student-attendance', roles: ['Student'] },
                { name: 'Result', path: '/student/result', roles: ['Student'] },
                { name: 'Fee Status', path: '/student-fees', roles: ['Student'] },
                { name: 'AI Assistant', path: '/ai-assistant', roles: ['Student'] }
            );
        }

        return links;
    };

    const navLinks = getNavLinks();

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen hidden lg:flex flex-col fixed h-full transition-all duration-300">
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                <h1 className="text-2xl font-bold tracking-wider text-blue-500">IAMS</h1>
            </div>

            <nav className="flex-grow p-4 space-y-2 overflow-y-auto mt-4">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
                    return (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`block px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-blue-600 text-white font-medium shadow-md'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {link.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800 text-xs text-gray-500 text-center">
                v1.0.0
            </div>
        </aside>
    );
};

export default Sidebar;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
