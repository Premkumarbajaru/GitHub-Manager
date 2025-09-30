import React from 'react';
import { render, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Create a custom render function that includes providers
export const renderWithProviders = (ui, options = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const AllProviders = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: AllProviders, ...options });
};

// Helper to flush React state updates in tests using react-query
export const flushPromises = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

// Mock user data
export const mockUser = {
  id: '123',
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: 'https://avatars.githubusercontent.com/u/123',
  profileUrl: 'https://github.com/testuser',
};

// Mock repository data
export const mockRepository = {
  id: 1,
  name: 'test-repo',
  full_name: 'testuser/test-repo',
  owner: {
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/u/123',
  },
  description: 'A test repository',
  html_url: 'https://github.com/testuser/test-repo',
  private: false,
  fork: false,
  stargazers_count: 10,
  forks_count: 5,
  watchers_count: 8,
  language: 'JavaScript',
  updated_at: '2024-01-01T00:00:00Z',
  topics: ['test', 'javascript'],
};

// Mock pull request data
export const mockPullRequest = {
  id: 1,
  number: 1,
  title: 'Test Pull Request',
  body: 'This is a test pull request',
  state: 'open',
  merged: false,
  user: {
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/u/123',
  },
  head: {
    ref: 'feature-branch',
  },
  base: {
    ref: 'main',
  },
  html_url: 'https://github.com/testuser/test-repo/pull/1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  additions: 50,
  deletions: 10,
  changed_files: 3,
};

// Mock comment data
export const mockComment = {
  id: 1,
  body: 'Hello World',
  user: {
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/u/123',
  },
  created_at: '2024-01-01T00:00:00Z',
};

export * from '@testing-library/react';
