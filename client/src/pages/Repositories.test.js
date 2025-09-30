import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders, mockRepository, flushPromises } from '../utils/testUtils';
import Repositories from './Repositories';
import { apiService } from '../services/apiService';

jest.mock('../services/apiService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('Repositories Page', () => {
  const mockRepositories = {
    repositories: [
      mockRepository,
      {
        ...mockRepository,
        id: 2,
        name: 'private-repo',
        full_name: 'testuser/private-repo',
        private: true,
      },
      {
        ...mockRepository,
        id: 3,
        name: 'forked-repo',
        full_name: 'testuser/forked-repo',
        fork: true,
      },
    ],
    total_count: 3,
    page: 1,
    per_page: 20,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    apiService.getRepositories.mockResolvedValue(mockRepositories);
  });

  it('renders repositories list', async () => {
    renderWithProviders(<Repositories />);

    await waitFor(() => {
      expect(screen.getByText('testuser/test-repo')).toBeInTheDocument();
      expect(screen.getByText('testuser/private-repo')).toBeInTheDocument();
      expect(screen.getByText('testuser/forked-repo')).toBeInTheDocument();
    });
  });

  it('displays repository statistics', async () => {
    renderWithProviders(<Repositories />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total repos
    });
  });

  it('categorizes repositories correctly', async () => {
    renderWithProviders(<Repositories />);

    await waitFor(() => {
      expect(screen.getByText('Public Repositories')).toBeInTheDocument();
      expect(screen.getByText('Private Repositories')).toBeInTheDocument();
      expect(screen.getByText('Forked Repositories')).toBeInTheDocument();
    });
  });

  it('allows searching repositories', async () => {
    const searchResults = {
      repositories: [mockRepository],
      total_count: 1,
      page: 1,
      per_page: 20,
    };

    apiService.getRepositories.mockResolvedValueOnce(mockRepositories);
    apiService.getRepositories.mockResolvedValueOnce(searchResults);

    renderWithProviders(<Repositories />);

    await waitFor(() => {
      expect(screen.getByText('testuser/test-repo')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search repositories/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(apiService.getRepositories).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test',
        })
      );
    }, { timeout: 500 });
  });

  it('allows filtering by repository type', async () => {
    renderWithProviders(<Repositories />);

    await waitFor(() => {
      expect(screen.getByText('testuser/test-repo')).toBeInTheDocument();
    });

    const typeFilter = screen.getByRole('combobox', { name: 'Type' });
    fireEvent.change(typeFilter, { target: { value: 'public' } });

    await waitFor(() => {
      expect(apiService.getRepositories).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'public',
        })
      );
    });
  });

  it('allows sorting repositories', async () => {
    renderWithProviders(<Repositories />);

    await waitFor(() => {
      expect(screen.getByText('testuser/test-repo')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox', { name: 'Sort by' });
    fireEvent.change(sortSelect, { target: { value: 'full_name' } });

    await waitFor(() => {
      expect(apiService.getRepositories).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'full_name',
        })
      );
    });
  });

  it('displays repository metadata', async () => {
    renderWithProviders(<Repositories />);

    await waitFor(() => {
      expect(screen.getAllByText('JavaScript').length).toBeGreaterThan(0);
      expect(screen.getAllByText('10').length).toBeGreaterThan(0); // Stars
    });
  });

  it('handles loading state', () => {
    apiService.getRepositories.mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<Repositories />);
    
    // Should show at least one loading spinner
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });

  it('handles error state', async () => {
    apiService.getRepositories.mockRejectedValue(new Error('Failed to fetch'));

    renderWithProviders(<Repositories />);

    await flushPromises();
    // Fallback: page should render without crashing and not show list
    expect(screen.queryByText('testuser/test-repo')).not.toBeInTheDocument();
  });

  it('displays empty state when no repositories found', async () => {
    apiService.getRepositories.mockResolvedValue({
      repositories: [],
      total_count: 0,
      page: 1,
      per_page: 20,
    });

    renderWithProviders(<Repositories />);

    await waitFor(() => {
      expect(screen.getByText('No repositories')).toBeInTheDocument();
    });
  });

  it('can clear filters', async () => {
    renderWithProviders(<Repositories />);

    await waitFor(() => {
      expect(screen.getByText('testuser/test-repo')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search repositories/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput.value).toBe('');
    });
  });
});
