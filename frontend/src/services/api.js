import axios from 'axios';

const createApi = (token = null) => {
    const api = axios.create({
        baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        },
    });
    
    // Response interceptor for error handling
    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401) {
                // Handle unauthorized error
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );
    
    return api;
};

export const createAuthenticatedApi = (token) => {
    const api = createApi(token);
    
    return {
        // Services
        getAllServices: () => api.get('/services/'),
        createService: (data) => api.post('/services/', data),
        getService: (id) => api.get(`/services/${id}`),
        getServiceDeployments: (id) => api.get(`/services/${id}/deployments/`),
        
        // Deployments
        createDeployment: (serviceId, data) => 
            api.post(`/services/${serviceId}/deployments/`, data),
        getDeploymentStatus: (id) => api.get(`/deployments/${id}/status`),
    };
};

// Create and export a default instance of the API
export const serviceApi = createAuthenticatedApi(localStorage.getItem('token'));