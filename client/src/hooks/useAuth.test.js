import React from 'react';
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';
import { AuthProvider } from '../contexts/AuthContext';

// Mock authService
jest.mock('../services/authService', () => ({
  __esModule: true,
  default: {
    getAuthStatus: jest.fn(),
    logout: jest.fn(),
    getLoginUrl: jest.fn(() => '/auth/github'),
  },
}));

describe('useAuth Hook', () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

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