import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status on mount and when location changes
  useEffect(() => {
    let isMounted = true;
    
    const handleAuthCheck = async () => {
      if (!isMounted) return;
      
      try {
        const { authenticated, user } = await authService.getAuthStatus();
        
        if (!isMounted) return;
        
        setUser(authenticated ? user : null);
        
        // If user is not authenticated and on a protected route, redirect to login
        const isLoginPage = location.pathname === '/login';
        if (!authenticated && !isLoginPage) {
          navigate('/login', { 
            state: { from: location },
            replace: true 
          });
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Only check auth status if we're not already loading
    if (loading) {
      handleAuthCheck();
    }
    
    // Listen for popstate (back/forward navigation)
    const handlePopState = () => {
      handleAuthCheck();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      isMounted = false;
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, navigate, loading]);

  const checkAuthStatus = useCallback(async () => {
    try {
      // Only set loading if not already loading
      setLoading(prev => prev ? prev : true);
      
      const { authenticated, user } = await authService.getAuthStatus();
      
      // Only update state if the authentication status has changed
      setUser(prevUser => {
        const userChanged = !prevUser && user || prevUser?.id !== user?.id;
        return userChanged ? user : prevUser;
      });
      
      return authenticated;
    } catch (error) {
      // Don't log 401 errors as they're expected when not authenticated
      if (error.response?.status !== 401) {
        console.error('Auth status check failed:', error);
      }
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(() => {
    try {
      setLoginLoading(true);
      
      // Store the current location to redirect back after login
      const returnTo = location.state?.from?.pathname || 
                      (window.location.pathname !== '/login' ? 
                       window.location.pathname + window.location.search : 
                       '/dashboard');
      
      // Store the return URL in session storage
      sessionStorage.setItem('returnUrl', returnTo);
      
      // Get the GitHub OAuth URL
      const authUrl = authService.getGitHubAuthUrl();
      console.log('Redirecting to GitHub OAuth:', authUrl);
      
      // Use window.location.replace to prevent back button issues
      window.location.replace(authUrl);
      
    } catch (error) {
      console.error('Login initialization failed:', error);
      toast.error('Failed to initialize login');
      setLoginLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  }, [navigate]);

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
