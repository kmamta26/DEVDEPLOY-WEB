import axios from 'axios';

// Unified API Client for DevDeploy Unified Pipeline
// Uses environment variable VITE_API_URL if provided, else defaults to relative /api
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000, // 10s timeout
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
    // Check for "token" key (Primary) and "devdeploy_token" (Legacy)
    let token = localStorage.getItem('token') || localStorage.getItem('devdeploy_token');
    
    // Developer Fallback: Inject a mock token for active development if none exists
    // This allows the UI to stay active even during backend cold starts
    if (!token && (window.location.hostname === 'localhost' || window.location.hostname.includes('netlify.app'))) {
        console.info('🛠️ API: No token found. Using development session context.');
        token = 'dev_mock_token_active';
        localStorage.setItem('token', token);
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Handle Global Errors (Like 401 Unauthorized / Token Expired)
api.interceptors.response.use(
    (response) => {
        // Log successful API interactions in development
        if (import.meta.env.DEV) {
            console.log(`✅ API Response [${response.config.method.toUpperCase()}]: ${response.config.url}`);
        }
        return response;
    },
    (error) => {
        const status = error.response ? error.response.status : null;

        if (status === 401) {
            console.warn('❌ Session expired or invalid token. Redirecting to login.');
            
            // Clear current token and session info to prevent loops
            localStorage.removeItem('token');
            localStorage.removeItem('devdeploy_token');
            localStorage.removeItem('user');
            
            // Auto Logout User logic
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login?expired=true';
            }
        }
        
        if (!error.response) {
            console.error('🚫 Network Error: Backend might be offline or unreachable.');
        }

        return Promise.reject(error);
    }
);

export default api;

