import axios from 'axios';

// API temel URL'i
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Axios instance oluştur
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Service API calls
export const serviceApi = {
    // Tüm servisleri getir
    getAllServices: () => api.get('/services/'),
    
    // Yeni servis ekle
    createService: (data) => api.post('/services/', data),
    
    // Tek bir servis getir
    getService: (id) => api.get(`/services/${id}`),
    
    // Servis deployment'larını getir
    getServiceDeployments: (id) => api.get(`/services/${id}/deployments/`),
    
    // Yeni deployment başlat
    createDeployment: (serviceId, data) => 
        api.post(`/services/${serviceId}/deployments/`, data),
};

// Deployment API calls
export const deploymentApi = {
    // Deployment durumunu kontrol et
    getDeploymentStatus: (id) => api.get(`/deployments/${id}/status`),
};

// Global error handler
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // API hatası (400, 401, 403, 404, 500 etc.)
            console.error('API Error:', error.response.data);
            throw new Error(error.response.data.detail || 'An error occurred');
        } else if (error.request) {
            // Network hatası
            console.error('Network Error:', error.request);
            throw new Error('Network error - please check your connection');
        } else {
            // Diğer hatalar
            console.error('Error:', error.message);
            throw error;
        }
    }
);