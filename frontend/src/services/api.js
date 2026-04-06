import axios from 'axios';

// Unified API Client for Port 5000 Active sessions
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
    // Check for "token" key as requested by user
    let token = localStorage.getItem('token');
    
    // Developer Fallback: Inject a mock token for active development if none exists
    // This allows instant testing even without full login sequence
    if (!token) {
        token = 'dev_mock_token_active';
        localStorage.setItem('token', token);
    }

    if (token) {
        // Bearer header format for backend middleware
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Handle Global Errors (Like 401 Unauthorized / Token Expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('❌ Session expired or invalid token. Redirecting to login.');
            
            // Clear current token and session info
            localStorage.removeItem('token');
            localStorage.removeItem('devdeploy_token'); // Clear legacy keys too
            
            // Auto Logout User logic
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
