// Path: frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
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

// Add response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried refreshing the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, redirect to login
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Try to refresh the token
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken
        });
        
        if (response.data.access) {
          localStorage.setItem('token', response.data.access);
          
          // Update the original request's Authorization header
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Failed to refresh token, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;