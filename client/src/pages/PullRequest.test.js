import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockPullRequest, mockComment } from '../utils/testUtils';
import PullRequest from './PullRequest';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('../services/apiService');
jest.mock('react-hot-toast');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    owner: 'testuser',
    repo: 'test-repo',
    number: '1',
  }),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      username: 'testuser',
      avatarUrl: 'https://avatars.githubusercontent.com/u/123',
      displayName: 'Test User',
    },
  }),
}));

describe('PullRequest Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiService.getPullRequest.mockResolvedValue(mockPullRequest);
    apiService.getPullRequestComments.mockResolvedValue({
      comments: [mockComment],
    });
  });

  it('renders pull request details', async () => {
    renderWithProviders(<PullRequest />);

    await waitFor(() => {
      expect(screen.getByText('Test Pull Request')).toBeInTheDocument();
    });

    expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
    expect(screen.getByText(/feature-branch/)).toBeInTheDocument();
  });

  it('displays pull request status', async () => {
    renderWithProviders(<PullRequest />);

    await waitFor(() => {
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  it('displays PR statistics', async () => {
    renderWithProviders(<PullRequest />);

    await waitFor(() => {
      expect(screen.getByText('+50')).toBeInTheDocument();
      expect(screen.getByText('-10')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('displays existing comments', async () => {
    renderWithProviders(<PullRequest />);

    await waitFor(() => {
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
  });

  it('allows user to add a comment', async () => {
    apiService.addPullRequestComment.mockResolvedValue({
      ...mockComment,
      body: 'New comment',
    });

    renderWithProviders(<PullRequest />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Leave a comment/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Leave a comment/i);
    const submitButton = screen.getByRole('button', { name: /Add Comment/i });

    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiService.addPullRequestComment).toHaveBeenCalledWith(
        'testuser',
        'test-repo',
        1,
        'Hello World'
      );
    });
  });

  it('shows error toast when comment submission fails', async () => {
    const errorMessage = 'Failed to add comment';
    apiService.addPullRequestComment.mockRejectedValue({
      message: errorMessage,
      response: { data: { error: errorMessage } }
    });

    renderWithProviders(<PullRequest />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Leave a comment/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/Leave a comment/i);
    const submitButton = screen.getByRole('button', { name: /Add Comment/i });

    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Failed to add comment'));
    });
  });

  it('prevents empty comment submission', async () => {
    renderWithProviders(<PullRequest />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Leave a comment/i)).toBeInTheDocument();
    });

    // Button should be disabled when textarea is empty
    const submitButton = screen.getByRole('button', { name: /Add Comment/i });
    expect(submitButton).toBeDisabled();
    
    expect(apiService.addPullRequestComment).not.toHaveBeenCalled();
  });

  it('displays "no comments" message when there are no comments', async () => {
    apiService.getPullRequestComments.mockResolvedValue({
      comments: [],
    });

    renderWithProviders(<PullRequest />);

    await waitFor(() => {
      expect(screen.getByText('No comments yet')).toBeInTheDocument();
    });
  });

  it('displays View on GitHub link', async () => {
    renderWithProviders(<PullRequest />);

    await waitFor(() => {
      const link = screen.getByText('View on GitHub');
      expect(link.closest('a')).toHaveAttribute('href', mockPullRequest.html_url);
    });
  });

  it('handles loading state', () => {
    apiService.getPullRequest.mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<PullRequest />);
    
    // Should show skeleton loaders with animate-pulse class
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('handles error state when fetching PR fails', async () => {
    apiService.getPullRequest.mockRejectedValue(new Error('Failed to fetch'));

    renderWithProviders(<PullRequest />);

    await waitFor(() => {
      expect(screen.getByText('Error loading pull request')).toBeInTheDocument();
    });
  });
});
