// Path: frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create the authentication context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if the user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        if (token) {
          // Try to get current user info from API
          const result = await authService.getCurrentUser();
          if (result.success) {
            setUser(result.user);
            setIsAuthenticated(true);
          } else {
            // Invalid or expired token, clear localStorage
            localStorage.clear();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(username, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        setLoading(false);
        return { success: true };
      } else {
        setError(result.error || 'Login failed');
        setLoading(false);
        return { success: false, error: result.error || 'Login failed' };
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    return { success: true };
  };

  // Value object to be provided by the context
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;