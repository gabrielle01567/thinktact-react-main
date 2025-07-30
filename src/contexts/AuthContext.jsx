import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('thinktact_token');
    const savedUser = localStorage.getItem('thinktact_user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('thinktact_token');
        localStorage.removeItem('thinktact_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Try API authentication
      const result = await authService.loginUser(email, password);
      
      console.log('🔍 Login result:', result);
      
      if (result.success && result.user && result.token) {
        // Save the real JWT token from backend
        console.log('🔍 Storing JWT token:', result.token.substring(0, 20) + '...');
        localStorage.setItem('thinktact_token', result.token);
        localStorage.setItem('thinktact_user', JSON.stringify(result.user));
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        // Check if the error is about email verification
        if (result.error && result.error.includes('verify your email')) {
          return { 
            success: false, 
            error: 'Please verify your email before logging in.',
            needsVerification: true,
            email: email 
          };
        }
        // Return the error from the API
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const register = async (email, password, userData) => {
    try {
      console.log('🔍 AuthContext: Starting registration...');
      console.log('🔍 AuthContext: Email:', email);
      console.log('🔍 AuthContext: User data:', { ...userData, password: '[HIDDEN]' });
      
      const result = await authService.registerUser(email, password, userData);
      
      console.log('🔍 AuthContext: Registration result:', result);
      
      if (result.success) {
        // Return success without auto-login - user will be redirected to verification page
        return { success: true };
      } else {
        return result;
      }
    } catch (error) {
      console.error('🔍 AuthContext: Registration error:', error);
      return { success: false, error: 'Registration failed: ' + error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('thinktact_token');
    localStorage.removeItem('thinktact_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('thinktact_user', JSON.stringify(updatedUserData));
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 