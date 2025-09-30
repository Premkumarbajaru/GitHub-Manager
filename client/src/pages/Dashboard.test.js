import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/testUtils';
import Dashboard from './Dashboard';
import apiService from '../services/apiService';

jest.mock('../services/apiService');

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    apiService.getRepositories.mockResolvedValue({
      repositories: [
        { id: 1, name: 'test-repo', full_name: 'user/test-repo', private: false, fork: false, stargazers_count: 10, owner: { login: 'user' }, updated_at: new Date().toISOString() }
      ],
      total_count: 1
    });
  });

  it('renders dashboard title', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    apiService.getRepositories.mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<Dashboard />);
    
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('displays repository statistics', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeInTheDocument();
    });
  });
});
