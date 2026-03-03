import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
    const { user } = useAuth();

    // If there's no user, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, render the child routes (e.g. Dashboard)
    return <Outlet />;
};

export default PrivateRoute;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
