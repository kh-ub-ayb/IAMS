import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleProtectedRoute ensures the authenticated user has one of the allowed roles.
 * @param {Array<string>} allowedRoles - e.g. ['SuperAdmin', 'Manager', 'Teacher']
 */
const RoleProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    // If there's no user, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user role is not in the allowed list, redirect to Access Denied
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/access-denied" replace />;
    }

    // User has access, render child components
    return <Outlet />;
};

export default RoleProtectedRoute;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
