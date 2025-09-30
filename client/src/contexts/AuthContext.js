import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await authService.getAuthStatus();
      
      if (response.authenticated) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // 401 is expected when user is not authenticated, don't log as error
      if (error.response?.status !== 401) {
        console.error('Auth status check failed:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Set login loading state
    setLoginLoading(true);
    // Redirect to GitHub OAuth
    console.log('Initiating GitHub OAuth...');
    const authUrl = 'http://localhost:5000/auth/github';
    console.log('Redirecting to:', authUrl);
    window.location.href = authUrl;
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  const value = {
    user,
    loading,
    loginLoading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
