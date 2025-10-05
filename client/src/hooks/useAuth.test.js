import React from 'react';
import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './useAuth';
import { AuthProvider } from '../contexts/AuthContext';

// Mock authService
jest.mock('../services/authService', () => ({
  __esModule: true,
  default: {
    getAuthStatus: jest.fn(() => Promise.resolve({ authenticated: false, user: null })),
    logout: jest.fn(() => Promise.resolve()),
    getGitHubAuthUrl: jest.fn(() => '/auth/github'),
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/', state: null }),
  useNavigate: () => jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('useAuth Hook', () => {
  const wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  it('provides auth context', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
  });

  it('exports useAuth hook', () => {
    expect(typeof useAuth).toBe('function');
  });
});