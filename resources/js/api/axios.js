import axios from 'axios';

const api = axios.create({
    baseURL: process.env.API_URL || 'http://localhost:8000/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Clear invalid token and redirect to login
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            
            // Only redirect if not already on login/register page
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register') {
                // Silently fail for API calls - let the component handle it
                // Don't redirect to avoid disrupting UX
            }
        }
        return Promise.reject(error);
    }
);

export default api;

