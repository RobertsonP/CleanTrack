// Path: frontend/src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create an axios instance
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

const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, {
        username,
        password
      });
      
      if (response.data && response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        
        // Get user info
        const userResponse = await api.get(`${API_URL}/auth/me/`);
        const userData = userResponse.data;
        
        localStorage.setItem('username', userData.username);
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true, user: userData };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  },
  
  logout: () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return { success: true };
  },
  
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, error: 'No authentication token' };
      }
      
      const response = await api.get(`${API_URL}/auth/me/`);
      return { success: true, user: response.data };
    } catch (error) {
      console.error("Get current user error:", error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get user information' 
      };
    }
  },
  
  getAllUsers: async () => {
    try {
      const response = await api.get(`${API_URL}/auth/users/`);
      return response.data;
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  },
  
  registerUser: async (userData) => {
    try {
      const response = await api.post(`${API_URL}/auth/register/`, userData);
      return { success: true, user: response.data };
    } catch (error) {
      console.error("Register user error:", error);
      return { 
        success: false, 
        error: error.response?.data || 'Registration failed' 
      };
    }
  },
  
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`${API_URL}/auth/users/${id}/`, userData);
      return { success: true, user: response.data };
    } catch (error) {
      console.error("Update user error:", error);
      return { 
        success: false, 
        error: error.response?.data || 'Update failed' 
      };
    }
  },
  
  deleteUser: async (id) => {
    try {
      await api.delete(`${API_URL}/auth/users/${id}/`);
      return { success: true };
    } catch (error) {
      console.error("Delete user error:", error);
      return { 
        success: false, 
        error: error.response?.data || 'Delete failed' 
      };
    }
  }
};

export default authService;