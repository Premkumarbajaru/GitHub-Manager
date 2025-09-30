import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/testUtils';
import Repository from './Repository';
import apiService from '../services/apiService';

jest.mock('../services/apiService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ owner: 'testuser', repo: 'test-repo' }),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('Repository Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    apiService.getRepository.mockResolvedValue({
      id: 1,
      name: 'test-repo',
      full_name: 'testuser/test-repo',
      description: 'Test repository',
      stargazers_count: 10,
      forks_count: 5,
      open_issues_count: 2,
      owner: { login: 'testuser' },
      updated_at: new Date().toISOString()
    });
    
    apiService.getPullRequests.mockResolvedValue({
      pull_requests: [
        { id: 1, number: 1, title: 'Test PR', state: 'open', user: { login: 'testuser' }, created_at: new Date().toISOString() }
      ]
    });
  });

  it('renders repository page', async () => {
    renderWithProviders(<Repository />);
    
    await waitFor(() => {
      expect(screen.getByText('test-repo')).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    apiService.getRepository.mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<Repository />);
    
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('displays repository stats', async () => {
    renderWithProviders(<Repository />);
    
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Stars
    });
  });
});
