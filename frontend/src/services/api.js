import axios from 'axios';
import toast from 'react-hot-toast';

// Create Axios Instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// We will store the access token in memory
let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

export const getAccessToken = () => {
    return accessToken;
};

export const clearTokens = () => {
    accessToken = null;
    localStorage.removeItem('refreshToken');
};

// Intercept requests to inject the access token
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- Global Response Interceptor (Error Handling & Token Refresh) ---
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Ensure we have a response object
        if (!error.response) {
            toast.error('Network Error: Please check your internet connection.');
            return Promise.reject(error);
        }

        const { status, data } = error.response;

        // --- Handle 401 Unauthorized (Token Expiry) ---
        if (status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // prevent infinite loop

            // Try to use the refresh token from localStorage
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    // Make an explicit call (bypassing the interceptor) to get a new token
                    const refreshRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
                        token: refreshToken
                    });

                    // Set the new token
                    const newAccessToken = refreshRes.data.accessToken;

                    // Note: In our current setup, the access token is kept in memory in AuthContext.
                    // But we still need to attach it to the pending request here.
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // We dispatch a custom event here so AuthContext can hear it and update its state too
                    window.dispatchEvent(new CustomEvent('auth_token_refreshed', { detail: newAccessToken }));

                    // Retry the original request
                    return api(originalRequest);
                } catch (refreshErr) {
                    // Refresh token is invalid/expired
                    localStorage.removeItem('refreshToken');
                    window.dispatchEvent(new Event('auth_logout_required'));
                    toast.error('Session expired. Please log in again.');
                    return Promise.reject(refreshErr);
                }
            } else {
                // No refresh token available
                window.dispatchEvent(new Event('auth_logout_required'));
                return Promise.reject(error);
            }
        }

        // --- Handle Global Error Toasts ---
        // Exclude specific endpoints where components handle errors locally (like the AI Chat or Login)
        const isSilentEndpoint = originalRequest.url.includes('/ai/ask') || originalRequest.url.includes('/auth/login');

        if (!isSilentEndpoint) {
            const errorMsg = data?.error?.message || data?.message || 'An unexpected error occurred.';
            toast.error(errorMsg);
        }

        return Promise.reject(error);
    }
);

export default api;

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
