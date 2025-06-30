import React, { createContext, useContext, useState, useEffect } from 'react';

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
      // For demo purposes, accept any email/password combination
      // In production, this would validate against your backend
      if (email && password) {
        const userData = {
          id: Date.now(),
          email: email,
          name: email.split('@')[0], // Use email prefix as name
          createdAt: new Date().toISOString()
        };
        
        // Generate a simple token (in production, this would come from your backend)
        const token = btoa(JSON.stringify(userData) + Date.now());
        
        // Save to localStorage
        localStorage.setItem('thinktact_token', token);
        localStorage.setItem('thinktact_user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        return { success: false, error: 'Email and password are required' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('thinktact_token');
    localStorage.removeItem('thinktact_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 