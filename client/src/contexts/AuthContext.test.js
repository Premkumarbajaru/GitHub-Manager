import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock authService
jest.mock('../services/authService', () => ({
  __esModule: true,
  default: {
    getAuthStatus: jest.fn().mockResolvedValue({
      authenticated: false,
      user: null,
    }),
    logout: jest.fn().mockResolvedValue({ success: true }),
    getLoginUrl: jest.fn(() => '/auth/github'),
    api: {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    },
  },
}));

describe('AuthContext', () => {
  const TestComponent = () => {
    const { user, loading, login, logout } = useAuth();
    
    return (
      <div>
        <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
        <div data-testid="user">{user ? user.username : 'No User'}</div>
        <button onClick={login}>Login</button>
        <button onClick={logout}>Logout</button>
      </div>
    );
  };

  it('provides auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('user')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('exports AuthProvider component', () => {
    expect(AuthProvider).toBeDefined();
    expect(typeof AuthProvider).toBe('function');
  });

  it('exports useAuth hook', () => {
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe('function');
  });
});