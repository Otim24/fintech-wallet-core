import axios from 'axios';

const api = axios.create({
    baseURL: '', // Requests will be proxied by Next.js to http://localhost:8000
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                // DRF usually expects 'Token <key>' or 'Bearer <key>' depending on config.
                // We haven't configured DRF Authentication classes explicitly in settings other than 'rest_framework.authentication.SessionAuthentication'?
                // Wait, verifying settings...
                // core/settings/base.py does not enforce REST_FRAMEWORK defaults for AUTH.
                // If we use simple JWT or TokenAuth later, we need to match.
                // For now, I will use 'Bearer' as a sane default for modern apps.
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
