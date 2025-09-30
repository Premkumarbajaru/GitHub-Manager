import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/testUtils';
import FileViewer from './FileViewer';
import { apiService } from '../services/apiService';

jest.mock('../services/apiService');

describe('FileViewer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const owner = 'testuser';
  const repo = 'test-repo';
  const filePath = 'src/index.js';

  it('renders file content', async () => {
    apiService.getFileContent.mockResolvedValue({
      decodedContent: 'console.log("Hello World");',
      size: 23,
      download_url: 'https://example.com/file'
    });

    renderWithProviders(
      <FileViewer owner={owner} repo={repo} filePath={filePath} onBack={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText(/console\.log/)).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    apiService.getFileContent.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(
      <FileViewer owner={owner} repo={repo} filePath={filePath} onBack={() => {}} />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    apiService.getFileContent.mockRejectedValue(new Error('Failed to fetch'));

    renderWithProviders(
      <FileViewer owner={owner} repo={repo} filePath={filePath} onBack={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText(/Error loading file/)).toBeInTheDocument();
    });
  });
});
