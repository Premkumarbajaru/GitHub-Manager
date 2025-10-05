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
    let authCheckTimeout;
    
    const handleAuthCheck = async () => {
      if (!isMounted) return;
      
      try {
        // Add a small delay to prevent rapid consecutive checks
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;
        
        console.log('Checking auth status, current location:', location.pathname);
        console.log('Current URL:', window.location.href);
        const authResult = await authService.getAuthStatus();
        
        if (!isMounted) return;
        
        const { authenticated, user } = authResult || {};
        console.log('Auth result:', { authenticated, user: user ? user.username : null });
        
        // Update user state if it has changed
        setUser(prevUser => {
          if (!authenticated) return null;
          const userChanged = (!prevUser && user) || (prevUser?.id !== user?.id);
          return userChanged ? user : prevUser;
        });
        
        // Determine if current page is an auth page
        const isAuthPage = ['/login', '/register', '/forgot-password'].includes(
          location.pathname
        );
        
        if (!authenticated) {
          // Only redirect if not already on an auth page and not in the middle of a redirect
          if (!isAuthPage && !location.state?.isRedirect) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login', { 
              state: { from: location, isRedirect: true },
              replace: true 
            });
          }
        } else if (isAuthPage) {
          // If user is authenticated but on auth page, redirect to home or previous page
          const from = location.state?.from?.pathname || '/';
          console.log('User authenticated, redirecting from', location.pathname, 'to', from);
          // Only navigate if we're not already there to prevent infinite loops
          if (location.pathname !== from) {
            navigate(from, { replace: true });
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Authentication check error:', error);
          setUser(null);
          
          // Only redirect if not already on login page and not a redirect
          if (location.pathname !== '/login' && !location.state?.isRedirect) {
            navigate('/login', { 
              state: { from: location, isRedirect: true },
              replace: true 
            });
          }
        }
      } finally {
        if (isMounted) {
          // Clear any existing timeout
          if (authCheckTimeout) clearTimeout(authCheckTimeout);
          
          // Add a small delay before setting loading to false to prevent flickering
          authCheckTimeout = setTimeout(() => {
            if (isMounted) {
              setLoading(false);
            }
          }, 300);
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
      if (authCheckTimeout) {
        clearTimeout(authCheckTimeout);
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location, navigate, loading]);

  const checkAuthStatus = useCallback(async () => {
    try {
      // Only set loading if not already loading
      setLoading(true);
      
      const { authenticated, user } = await authService.getAuthStatus();
      setUser(authenticated ? user : null);
      return authenticated;
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((redirectPath) => {
    try {
      setLoginLoading(true);
      
      // Use provided redirect path or default to current location or dashboard
      const returnTo = redirectPath || 
                      (window.location.pathname !== '/login' ? 
                       window.location.pathname + window.location.search : 
                       '/dashboard');
      
      // Store the return URL in session storage
      sessionStorage.setItem('returnUrl', returnTo);
      
      // Get the GitHub OAuth URL
      const authUrl = authService.getGitHubAuthUrl();
      console.log('Redirecting to GitHub OAuth:', authUrl);
      console.log('Return URL will be:', returnTo);
      
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
