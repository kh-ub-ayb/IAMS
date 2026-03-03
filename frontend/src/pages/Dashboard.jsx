import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
    const { user } = useAuth();

    // Route the user to the correct dashboard based on their role
    switch (user?.role) {
        case 'SuperAdmin':
            return <SuperAdminDashboard />;
        case 'Manager':
            return <ManagerDashboard />;
        case 'Teacher':
        case 'ClassTeacher':
            return <TeacherDashboard />;
        case 'Student':
            return <StudentDashboard />;
        default:
            return (
                <div className="flex items-center justify-center p-8">
                    <p className="text-gray-500">Assigning dashboard view...</p>
                </div>
            );
    }
};

export default Dashboard;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
