import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api, { setAccessToken } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Try to restore session on load using refreshToken (if we had a refresh endpoint hookup)
    // For simplicity based on requirements, we keep user logged out on hard refresh 
    // until refresh logic is fully implemented, or just check localStorage if we trust it lightly.
    useEffect(() => {
        const rToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('userMeta');

        if (rToken && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userMeta');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { data } = response.data;

            // Store access token in memory
            setAccessToken(data.accessToken);

            // Store refresh token in localStorage
            localStorage.setItem('refreshToken', data.refreshToken);

            // Decode user info from accessToken
            const decodedUser = jwtDecode(data.accessToken);
            const userProfile = { ...decodedUser, name: data.user.name, role: data.user.role };
            setUser(userProfile);

            // Persist the UI metadata to survive hard refreshes (prevents 403 Access Denied from Router)
            localStorage.setItem('userMeta', JSON.stringify(userProfile));

            navigate('/dashboard');
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.error?.message || 'Login failed'
            };
        }
    };

    const logout = useCallback(() => {
        // Clear tokens from memory and localStorage
        delete api.defaults.headers.common['Authorization'];
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userMeta');
        setUser(null);
        navigate('/login');
    }, [navigate]);

    useEffect(() => {
        // Axios interceptor throws this when refresh token is dead
        const handleLogoutRequired = () => {
            logout();
        };

        // Axios interceptor throws this when it successfully refreshes a token in the background
        const handleTokenRefreshed = (e) => {
            setToken(e.detail);
        };

        window.addEventListener('auth_logout_required', handleLogoutRequired);
        window.addEventListener('auth_token_refreshed', handleTokenRefreshed);

        return () => {
            window.removeEventListener('auth_logout_required', handleLogoutRequired);
            window.removeEventListener('auth_token_refreshed', handleTokenRefreshed);
        };
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
