const request = require('supertest');
const express = require('express');
const router = require('./api');
const githubService = require('../services/githubService');

jest.mock('../services/githubService');
jest.mock('../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    if (req.headers.authorization === 'Bearer test-token') {
      req.user = {
        id: '123',
        username: 'testuser',
        accessToken: 'github-access-token',
      };
      req.isAuthenticated = () => true;
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  },
}));

const app = express();
app.use(express.json());
app.use('/api', router);

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/repositories', () => {
    it('fetches repositories for authenticated user', async () => {
      const mockRepos = {
        repositories: [{ id: 1, name: 'test-repo' }],
        total_count: 1,
      };

      githubService.getUserRepositories.mockResolvedValue(mockRepos);

      const response = await request(app)
        .get('/api/repositories')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepos);
    });

    it('returns 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/api/repositories');

      expect(response.status).toBe(401);
    });

    it('handles service errors', async () => {
      githubService.getUserRepositories.mockRejectedValue(
        new Error('GitHub API error')
      );

      const response = await request(app)
        .get('/api/repositories')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/repositories/:owner/:repo/pulls', () => {
    it('fetches pull requests for a repository', async () => {
      const mockPRs = {
        pull_requests: [{ id: 1, number: 1, title: 'Test PR' }],
        page: 1,
        per_page: 30,
      };

      githubService.getPullRequests.mockResolvedValue(mockPRs);

      const response = await request(app)
        .get('/api/repositories/owner/repo/pulls')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPRs);
    });
  });

  describe('GET /api/repositories/:owner/:repo/pulls/:number', () => {
    it('fetches specific pull request', async () => {
      const mockPR = {
        id: 1,
        number: 1,
        title: 'Test PR',
        state: 'open',
      };

      githubService.getPullRequest.mockResolvedValue(mockPR);

      const response = await request(app)
        .get('/api/repositories/owner/repo/pulls/1')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPR);
    });
  });

  describe('GET /api/repositories/:owner/:repo/pulls/:number/comments', () => {
    it('fetches PR comments', async () => {
      const mockComments = {
        comments: [
          { id: 1, body: 'Comment 1' },
          { id: 2, body: 'Comment 2' },
        ],
        page: 1,
        per_page: 30,
      };

      githubService.getPullRequestComments.mockResolvedValue(mockComments);

      const response = await request(app)
        .get('/api/repositories/owner/repo/pulls/1/comments')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComments);
    });
  });

  describe('POST /api/repositories/:owner/:repo/pulls/:number/comments', () => {
    it('adds comment to pull request successfully', async () => {
      const mockComment = {
        id: 1,
        body: 'Hello World',
        user: { login: 'testuser' },
      };

      githubService.addPullRequestComment.mockResolvedValue(mockComment);

      const response = await request(app)
        .post('/api/repositories/owner/repo/pulls/1/comments')
        .set('Authorization', 'Bearer test-token')
        .send({ body: 'Hello World' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockComment);
      expect(githubService.addPullRequestComment).toHaveBeenCalledWith(
        'github-access-token',
        'owner',
        'repo',
        1,
        'Hello World'
      );
    });

    it('validates comment body is required', async () => {
      const response = await request(app)
        .post('/api/repositories/owner/repo/pulls/1/comments')
        .set('Authorization', 'Bearer test-token')
        .send({ body: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Comment body is required');
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/repositories/owner/repo/pulls/1/comments')
        .send({ body: 'Hello World' });

      expect(response.status).toBe(401);
    });

    it('handles GitHub API errors', async () => {
      githubService.addPullRequestComment.mockRejectedValue({
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      });

      const response = await request(app)
        .post('/api/repositories/owner/repo/pulls/1/comments')
        .set('Authorization', 'Bearer test-token')
        .send({ body: 'Hello World' });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/repositories/:owner/:repo/pulls', () => {
    it('creates pull request successfully', async () => {
      const mockPR = {
        id: 1,
        number: 1,
        title: 'New PR',
        state: 'open',
      };

      githubService.createPullRequest.mockResolvedValue(mockPR);

      const response = await request(app)
        .post('/api/repositories/owner/repo/pulls')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'New PR',
          head: 'feature-branch',
          base: 'main',
          body: 'Description',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockPR);
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/repositories/owner/repo/pulls')
        .set('Authorization', 'Bearer test-token')
        .send({ body: 'Description' });

      expect(response.status).toBe(400);
    });

    it('requires authentication', async () => {
      const response = await request(app)
        .post('/api/repositories/owner/repo/pulls')
        .send({
          title: 'New PR',
          head: 'feature',
          base: 'main',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/repositories/:owner/:repo/branches', () => {
    it('fetches repository branches', async () => {
      const mockBranches = [
        { name: 'main', commit: { sha: 'abc123' } },
        { name: 'develop', commit: { sha: 'def456' } },
      ];

      githubService.getRepositoryBranches.mockResolvedValue(mockBranches);

      const response = await request(app)
        .get('/api/repositories/owner/repo/branches')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBranches);
    });
  });
});
