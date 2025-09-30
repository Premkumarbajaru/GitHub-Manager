const githubService = require('./githubService');
const axios = require('axios');

jest.mock('axios');

describe('GitHub Service', () => {
  const mockAccessToken = 'test-access-token';
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axios.create.mockReturnValue(mockAxiosInstance);
  });

  describe('getUserRepositories', () => {
    it('fetches user repositories successfully', async () => {
      const mockRepos = [
        { id: 1, name: 'repo1', full_name: 'user/repo1' },
        { id: 2, name: 'repo2', full_name: 'user/repo2' },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockRepos });

      const result = await githubService.getUserRepositories(mockAccessToken);

      expect(result.repositories).toEqual(mockRepos);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/user/repos',
        expect.objectContaining({
          params: expect.objectContaining({
            page: 1,
            per_page: 30,
          }),
        })
      );
    });

    it('handles search queries', async () => {
      const mockSearchResults = {
        items: [{ id: 1, name: 'test-repo' }],
        total_count: 1,
      };

      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { login: 'testuser' } })
        .mockResolvedValueOnce({ data: mockSearchResults });

      const result = await githubService.getUserRepositories(mockAccessToken, {
        search: 'test',
      });

      expect(result.repositories).toEqual(mockSearchResults.items);
      expect(result.total_count).toBe(1);
    });

    it('handles API errors gracefully', async () => {
      const mockError = new Error('Request failed');
      mockError.response = { data: { message: 'API Error' } };
      
      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(
        githubService.getUserRepositories(mockAccessToken)
      ).rejects.toThrow('Request failed');
    });
  });

  describe('getRepository', () => {
    it('fetches specific repository successfully', async () => {
      const mockRepo = {
        id: 1,
        name: 'test-repo',
        owner: { login: 'testuser' },
        permissions: { push: true, pull: true, admin: false },
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockRepo });

      const result = await githubService.getRepository(
        mockAccessToken,
        'testuser',
        'test-repo'
      );

      expect(result).toEqual(mockRepo);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/repos/testuser/test-repo');
    });
  });

  describe('getPullRequests', () => {
    it('fetches pull requests for a repository', async () => {
      const mockPRs = [
        { id: 1, number: 1, title: 'PR 1' },
        { id: 2, number: 2, title: 'PR 2' },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockPRs });

      const result = await githubService.getPullRequests(
        mockAccessToken,
        'owner',
        'repo'
      );

      expect(result.pull_requests).toEqual(mockPRs);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/repos/owner/repo/pulls',
        expect.objectContaining({
          params: expect.objectContaining({
            state: 'open',
          }),
        })
      );
    });
  });

  describe('getPullRequest', () => {
    it('fetches specific pull request successfully', async () => {
      const mockPR = {
        id: 1,
        number: 1,
        title: 'Test PR',
        state: 'open',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockPR });

      const result = await githubService.getPullRequest(
        mockAccessToken,
        'owner',
        'repo',
        1
      );

      expect(result).toEqual(mockPR);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/repos/owner/repo/pulls/1');
    });
  });

  describe('getPullRequestComments', () => {
    it('fetches PR comments successfully', async () => {
      const mockComments = [
        { id: 1, body: 'Comment 1', user: { login: 'user1' } },
        { id: 2, body: 'Comment 2', user: { login: 'user2' } },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockComments });

      const result = await githubService.getPullRequestComments(
        mockAccessToken,
        'owner',
        'repo',
        1
      );

      expect(result.comments).toEqual(mockComments);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/repos/owner/repo/issues/1/comments',
        expect.any(Object)
      );
    });
  });

  describe('addPullRequestComment', () => {
    it('adds comment to pull request successfully', async () => {
      const mockComment = {
        id: 1,
        body: 'Hello World',
        user: { login: 'testuser' },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: mockComment });

      const result = await githubService.addPullRequestComment(
        mockAccessToken,
        'owner',
        'repo',
        1,
        'Hello World'
      );

      expect(result).toEqual(mockComment);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/repos/owner/repo/issues/1/comments',
        { body: 'Hello World' }
      );
    });

    it('handles comment addition errors with detailed logging', async () => {
      const mockError = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
        message: 'Request failed',
      };

      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(
        githubService.addPullRequestComment(
          mockAccessToken,
          'owner',
          'repo',
          1,
          'Test comment'
        )
      ).rejects.toThrow(/Failed to add comment/);
    });
  });

  describe('createPullRequest', () => {
    it('creates pull request successfully', async () => {
      const mockRepo = {
        default_branch: 'main',
        permissions: { push: true },
        owner: { login: 'testuser' },
        name: 'test-repo',
      };

      const mockPR = {
        id: 1,
        number: 1,
        title: 'New PR',
        state: 'open',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockRepo });
      mockAxiosInstance.post.mockResolvedValue({ data: mockPR });

      const result = await githubService.createPullRequest(
        mockAccessToken,
        'owner',
        'repo',
        {
          title: 'New PR',
          head: 'feature-branch',
          base: 'main',
          body: 'Description',
        }
      );

      expect(result).toEqual(mockPR);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/repos/owner/repo/pulls',
        expect.objectContaining({
          title: 'New PR',
          head: 'feature-branch',
          base: 'main',
        })
      );
    });

    it('throws error when user lacks push permissions', async () => {
      const mockRepo = {
        default_branch: 'main',
        permissions: { push: false },
        owner: { login: 'testuser' },
        name: 'test-repo',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockRepo });

      await expect(
        githubService.createPullRequest(mockAccessToken, 'owner', 'repo', {
          title: 'New PR',
          head: 'feature',
          base: 'main',
        })
      ).rejects.toThrow(/push permissions/);
    });

    it('handles validation errors (422)', async () => {
      const mockRepo = {
        default_branch: 'main',
        permissions: { push: true },
        owner: { login: 'testuser' },
        name: 'test-repo',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockRepo });
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 422,
          data: {
            message: 'Validation Failed',
            errors: [{ message: 'No commits between branches' }],
          },
        },
      });

      await expect(
        githubService.createPullRequest(mockAccessToken, 'owner', 'repo', {
          title: 'New PR',
          head: 'feature',
          base: 'main',
        })
      ).rejects.toThrow(/No commits found/);
    });
  });

  describe('getRepositoryBranches', () => {
    it('fetches repository branches successfully', async () => {
      const mockBranches = [
        { name: 'main', commit: { sha: 'abc123' } },
        { name: 'develop', commit: { sha: 'def456' } },
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: mockBranches });

      const result = await githubService.getRepositoryBranches(
        mockAccessToken,
        'owner',
        'repo'
      );

      expect(result).toEqual(mockBranches);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/repos/owner/repo/branches'
      );
    });

    it('handles branch fetch errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(
        githubService.getRepositoryBranches(mockAccessToken, 'owner', 'repo')
      ).rejects.toThrow(/Failed to fetch repository branches/);
    });
  });

  describe('getCurrentUser', () => {
    it('fetches current user successfully', async () => {
      const mockUser = {
        login: 'testuser',
        id: 123,
        avatar_url: 'https://avatars.githubusercontent.com/u/123',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: mockUser });

      const result = await githubService.getCurrentUser(mockAccessToken);

      expect(result).toEqual(mockUser);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/user');
    });
  });

  describe('createAuthenticatedClient', () => {
    it('creates axios instance with correct headers', () => {
      githubService.createAuthenticatedClient('test-token');

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.github.com',
        headers: {
          'Authorization': 'token test-token',
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-PR-Manager',
        },
      });
    });
  });
});
