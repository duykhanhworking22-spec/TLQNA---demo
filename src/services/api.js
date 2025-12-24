import axios from 'axios';

const API_URL = 'http://192.168.0.101:8081/api';
const ADMIN_API_URL = 'http://192.168.0.101:8081/api';

// Main API instance for Students and Advisors (Port 8081)
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Admin API instance (Port 8081)
const adminInstance = axios.create({
    baseURL: ADMIN_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for main api
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor for admin instance
adminInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth APIs (Using 8081)
export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    updateProfile: (data) => api.post('/auth/profile/update', data),
    changePassword: (data) => api.post('/auth/password/change', data),
};

// User APIs (Using 8081)
export const userApi = {
    getProfile: () => api.get('/users/profile'),
};

// Question APIs (Using 8081)
export const questionApi = {
    getAll: (params) => api.get('/questions', { params }),
    getById: (id) => api.get(`/questions/${id}`),
    create: (formData) => api.post('/questions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    answer: (id, formData) => api.post(`/questions/${id}/answer`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getHistory: (id) => api.get(`/questions/${id}/answers`),
    getLatestAnswer: (id) => api.get(`/questions/${id}/latest-answer`),
    downloadFile: (id) => api.get(`/questions/${id}/file`, { responseType: 'blob' }),
    report: (id, reason) => api.post(`/questions/${id}/report`, null, { params: { reason } }),
};

// Admin APIs (Using 8081)
export const adminApi = {
    createStudent: (email) => adminInstance.post('/admin/accounts/student', { email }),
    createAdvisor: (email) => adminInstance.post('/admin/accounts/advisor', { email }),
};

// Class/Filter APIs (Using 8081)
export const classApi = {
    getAll: () => api.get('/classes'),
    getCohorts: () => api.get('/classes/cohorts'),
    getMajors: () => api.get('/classes/majors'),
};

// FAQ APIs (Using 8081)
export const faqApi = {
    getAll: (params) => api.get('/faq', { params }),
    getById: (id) => api.get(`/faq/${id}`),
};

export default api;
