import axios from 'axios';

// Unified API Client for DevDeploy Unified Pipeline
// Standardized Central Client with Global Failover Simulation
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 15000 
});

// Helper check for Netlify/Demo context
const isDemo = () => window.location.hostname.includes('netlify.app') || window.location.hostname === 'localhost';

// Request Interceptor
api.interceptors.request.use((config) => {
    let token = localStorage.getItem('token') || localStorage.getItem('devdeploy_token');
    
    if (!token && isDemo()) {
        token = 'dev_mock_token_active';
        localStorage.setItem('token', token);
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => Promise.reject(error));

// Response Interceptor with Intelligent Mocking
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;
        const isFail = !response || response.status === 404 || error.code === 'ERR_NETWORK';

        if (isFail && isDemo()) {
            const url = config.url.toLowerCase();
            let mock = null;

            if (url.includes('/login')) mock = { token: 'demo', user: { username: 'Developer' } };
            else if (url.includes('/projects/upload')) mock = { id: 'demo', status: 'Live' };
            else if (url.includes('/projects')) mock = [{ id: '1', name: 'Alpha', status: 'Live', url: '#' }];
            else if (url.includes('/dashboard')) mock = { totalProjects: 12, activeProjects: 8, avgUptime: '99.9' };

            if (mock) return { data: mock, status: 200, config };
        }

        if (response && response.status === 401) {
            localStorage.clear();
            if (window.location.pathname !== '/login') window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
