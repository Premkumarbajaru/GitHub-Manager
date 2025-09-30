import axios from 'axios';

// Mock axios before importing apiService
jest.mock('axios');

// Create mock axios instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    response: {
      use: jest.fn(),
    },
  },
};

axios.create.mockReturnValue(mockAxiosInstance);

// Now import apiService after mocking
const { apiService } = require('./apiService');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRepositories', () => {
    it('fetches repositories successfully', async () => {
      const mockData = {
        repositories: [
          { id: 1, name: 'test-repo', full_name: 'user/test-repo' }
        ],
        total_count: 1
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await apiService.getRepositories();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/repositories', expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('handles repository fetch errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(apiService.getRepositories()).rejects.toThrow('Network error');
    });
  });

  describe('getRepository', () => {
    it('fetches single repository successfully', async () => {
      const mockRepo = { id: 1, name: 'test-repo', owner: { login: 'user' } };

      mockAxiosInstance.get.mockResolvedValue({ data: mockRepo });

      const result = await apiService.getRepository('user', 'test-repo');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/repositories/user/test-repo');
      expect(result).toEqual(mockRepo);
    });
  });

  describe('getPullRequests', () => {
    it('fetches pull requests successfully', async () => {
      const mockPRs = [
        { id: 1, number: 1, title: 'Test PR' }
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockPRs });

      const result = await apiService.getPullRequests('user', 'repo');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/repositories/user/repo/pulls', expect.any(Object));
      expect(result).toEqual(mockPRs);
    });
  });

  describe('getPullRequest', () => {
    it('fetches single pull request successfully', async () => {
      const mockPR = { id: 1, number: 1, title: 'Test PR' };

      mockAxiosInstance.get.mockResolvedValue({ data: mockPR });

      const result = await apiService.getPullRequest('user', 'repo', 1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/repositories/user/repo/pulls/1');
      expect(result).toEqual(mockPR);
    });
  });

  describe('addPullRequestComment', () => {
    it('adds comment successfully', async () => {
      const mockComment = { id: 1, body: 'Hello World' };

      mockAxiosInstance.post.mockResolvedValue({ data: mockComment });

      const result = await apiService.addPullRequestComment('user', 'repo', 1, 'Hello World');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/repositories/user/repo/pulls/1/comments',
        { body: 'Hello World' }
      );
      expect(result).toEqual(mockComment);
    });

    it('handles comment submission errors', async () => {
      const mockError = new Error('Failed to add comment');
      mockError.response = { status: 500, data: { error: 'Server error' } };
      
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(
        apiService.addPullRequestComment('user', 'repo', 1, 'Hello World')
      ).rejects.toThrow('Failed to add comment');
    });
  });

  describe('getPullRequestComments', () => {
    it('fetches comments successfully', async () => {
      const mockComments = [{ id: 1, body: 'Test comment' }];
      
      mockAxiosInstance.get.mockResolvedValue({ data: mockComments });

      const result = await apiService.getPullRequestComments('user', 'repo', 1);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/repositories/user/repo/pulls/1/comments', expect.any(Object));
      expect(result).toEqual(mockComments);
    });
  });

  describe('getRepositoryBranches', () => {
    it('fetches branches successfully', async () => {
      const mockBranches = [{ name: 'main' }, { name: 'develop' }];
      
      mockAxiosInstance.get.mockResolvedValue({ data: mockBranches });

      const result = await apiService.getRepositoryBranches('user', 'repo');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/repositories/user/repo/branches');
      expect(result).toEqual(mockBranches);
    });
  });

  describe('createPullRequest', () => {
    it('creates pull request successfully', async () => {
      const mockPR = { id: 1, number: 1, title: 'New PR' };
      
      mockAxiosInstance.post.mockResolvedValue({ data: mockPR });

      const result = await apiService.createPullRequest('user', 'repo', {
        title: 'New PR',
        head: 'feature',
        base: 'main',
        body: 'Description'
      });

      expect(mockAxiosInstance.post).toHaveBeenCalled();
      expect(result).toEqual(mockPR);
    });
  });
});