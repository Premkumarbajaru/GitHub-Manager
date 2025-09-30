import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/testUtils';
import PullRequests from './PullRequests';
import apiService from '../services/apiService';

jest.mock('../services/apiService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ owner: 'testuser', repo: 'test-repo' }),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('PullRequests Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    apiService.getRepositories = jest.fn().mockResolvedValue({
      repositories: [
        { id: 100, name: 'test-repo', full_name: 'testuser/test-repo', owner: { login: 'testuser' } }
      ]
    });

    apiService.getPullRequests.mockResolvedValue({
      pull_requests: [
        { id: 1, number: 1, title: 'Test PR', state: 'open', user: { login: 'testuser' }, updated_at: new Date().toISOString() }
      ]
    });
    
    apiService.getRepository.mockResolvedValue({
      id: 1,
      name: 'test-repo',
      full_name: 'testuser/test-repo'
    });
  });

  it('renders pull requests page header', async () => {
    renderWithProviders(<PullRequests />);
    await waitFor(() => {
      expect(screen.getAllByText(/Pull Requests/i).length).toBeGreaterThan(0);
    });
  });

  it('displays loading state', () => {
    apiService.getPullRequests.mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<PullRequests />);
    
    // skeletons render without role, assert presence of skeleton container
    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('handles empty pull requests', async () => {
    apiService.getPullRequests.mockResolvedValue({ pull_requests: [] });
    
    renderWithProviders(<PullRequests />);
    
    await waitFor(() => {
      expect(screen.getByText(/No pull requests found across your repositories/i)).toBeInTheDocument();
    });
  });
});
