const express = require('express');
const { body, validationResult } = require('express-validator');
const githubService = require('../services/githubService');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Simple test endpoint (no auth required) - BEFORE auth middleware
router.get('/debug', (req, res) => {
  res.json({ 
    message: 'API working!', 
    timestamp: new Date().toISOString(),
    authenticated: req.isAuthenticated(),
    user: req.user ? req.user.username : null
  });
});

// Check permissions for a specific repository
router.get('/check-permissions/:owner/:repo', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { owner, repo } = req.params;
    const repository = await githubService.getRepository(
      req.user.accessToken, 
      owner, 
      repo
    );
    
    const permissionCheck = {
      repositoryName: `${owner}/${repo}`,
      currentUser: req.user.username,
      repositoryOwner: repository.owner.login,
      permissions: repository.permissions,
      hasWriteAccess: repository.permissions?.push || false,
      hasAdminAccess: repository.permissions?.admin || false,
      canCreatePR: repository.permissions?.push || false,
      isOwner: repository.owner.login === req.user.username
    };
    
    console.log('=== PERMISSION CHECK ===');
    console.log(JSON.stringify(permissionCheck, null, 2));
    console.log('========================');
    
    res.json(permissionCheck);
  } catch (error) {
    console.error('Error checking permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check OAuth token scopes
router.get('/check-scopes', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const axios = require('axios');
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${req.user.accessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    // GitHub returns scopes in the X-OAuth-Scopes header
    const scopes = response.headers['x-oauth-scopes'] ? 
      response.headers['x-oauth-scopes'].split(', ') : [];

    const scopeCheck = {
      currentUser: req.user.username,
      tokenScopes: scopes,
      hasRepoScope: scopes.includes('repo'),
      hasPublicRepoScope: scopes.includes('public_repo'),
      hasUserEmailScope: scopes.includes('user:email'),
      canCreatePR: scopes.includes('repo') || scopes.includes('public_repo'),
      recommendedScopes: ['repo', 'user:email', 'read:org']
    };

    console.log('=== TOKEN SCOPE CHECK ===');
    console.log(JSON.stringify(scopeCheck, null, 2));
    console.log('=========================');

    res.json(scopeCheck);
  } catch (error) {
    console.error('Error checking token scopes:', error);
    res.status(500).json({ error: error.message });
  }
});

// Apply authentication middleware to all other API routes
router.use(requireAuth);

// Get current user profile
router.get('/user', (req, res) => {
  res.json(req.user.getPublicProfile());
});

// Get user repositories
router.get('/repositories', async (req, res) => {
  try {
    const { search, page = 1, per_page = 30 } = req.query;
    const repositories = await githubService.getUserRepositories(
      req.user.accessToken, 
      { search, page: parseInt(page), per_page: parseInt(per_page) }
    );
    
    res.json(repositories);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repositories',
      message: error.message 
    });
  }
});

// Get repository details
router.get('/repositories/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repository = await githubService.getRepository(
      req.user.accessToken, 
      owner, 
      repo
    );
    
    // Add permission summary for debugging
    const permissionSummary = {
      hasWriteAccess: repository.permissions?.push || false,
      hasAdminAccess: repository.permissions?.admin || false,
      canCreatePR: repository.permissions?.push || false,
      repositoryOwner: repository.owner.login,
      currentUser: req.user.username
    };
    
    console.log('Repository access check:', permissionSummary);
    
    res.json({
      ...repository,
      permissionSummary
    });
  } catch (error) {
    console.error('Error fetching repository:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch repository',
      message: error.message 
    });
  }
});

// Get pull requests for a repository
router.get('/repositories/:owner/:repo/pulls', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'open', page = 1, per_page = 30 } = req.query;
    
    const pullRequests = await githubService.getPullRequests(
      req.user.accessToken, 
      owner, 
      repo, 
      { state, page: parseInt(page), per_page: parseInt(per_page) }
    );
    
    res.json(pullRequests);
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch pull requests',
      message: error.message 
    });
  }
});

// Get pull request details
router.get('/repositories/:owner/:repo/pulls/:number', async (req, res) => {
  try {
    const { owner, repo, number } = req.params;
    const pullRequest = await githubService.getPullRequest(
      req.user.accessToken, 
      owner, 
      repo, 
      parseInt(number)
    );
    
    res.json(pullRequest);
  } catch (error) {
    console.error('Error fetching pull request:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch pull request',
      message: error.message 
    });
  }
});

// Get pull request comments
router.get('/repositories/:owner/:repo/pulls/:number/comments', async (req, res) => {
  try {
    const { owner, repo, number } = req.params;
    const { page = 1, per_page = 30 } = req.query;
    
    const comments = await githubService.getPullRequestComments(
      req.user.accessToken, 
      owner, 
      repo, 
      parseInt(number),
      { page: parseInt(page), per_page: parseInt(per_page) }
    );
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching PR comments:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch PR comments',
      message: error.message 
    });
  }
});

// Add comment to pull request
router.post('/repositories/:owner/:repo/pulls/:number/comments', [
  body('body')
    .trim()
    .notEmpty().withMessage('Comment body is required')
    .isLength({ max: 65536 }).withMessage('Comment body must be at most 65536 characters')
], async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { owner, repo, number: pullNumber } = req.params;
    const { body } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstMsg = errors.array()[0]?.msg || 'Validation failed';
      return res.status(400).json({ 
        error: firstMsg, 
        details: errors.array() 
      });
    }

    // Body presence validated above

    // Log detailed request information for debugging
    console.log('Adding PR comment:', {
      owner,
      repo,
      pullNumber,
      bodyLength: body.length,
      user: req.user?.username
    });

    const comment = await githubService.addPullRequestComment(
      req.user.accessToken,
      owner,
      repo,
      parseInt(pullNumber),
      body
    );

    res.status(201).json(comment);
  } catch (error) {
    console.error('Detailed PR comment route error:', {
      message: error.message,
      stack: error.stack,
      owner: req.params.owner,
      repo: req.params.repo,
      pullNumber: req.params.number,
      bodyLength: req.body.body?.length
    });

    // Determine appropriate error response
    if (error.response) {
      // GitHub API specific error
      return res.status(error.response.status || 500).json({
        error: error.response.data?.message || 'Failed to add comment',
        details: error.response.data
      });
    }

    // Generic server error
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Create a new pull request
router.post('/repositories/:owner/:repo/pulls', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      console.error('PR creation failed: User not authenticated');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { owner, repo } = req.params;
    const { title, body, head, base, draft } = req.body;

    console.log('PR creation request:', {
      owner,
      repo,
      title,
      head,
      base,
      draft,
      user: req.user?.username
    });

    if (!title || !head) {
      return res.status(400).json({ error: 'Title and head branch are required' });
    }

    if (!req.user?.accessToken) {
      console.error('PR creation failed: No access token');
      return res.status(401).json({ error: 'GitHub access token not found' });
    }

    const pullRequest = await githubService.createPullRequest(
      req.user.accessToken,
      owner,
      repo,
      { title, body, head, base, draft }
    );

    res.status(201).json(pullRequest);
  } catch (error) {
    console.error('Error in PR creation route:', {
      message: error.message,
      stack: error.stack,
      owner: req.params.owner,
      repo: req.params.repo,
      title: req.body.title,
      head: req.body.head
    });
    res.status(500).json({ error: error.message });
  }
});

// Get repository branches
router.get('/repositories/:owner/:repo/branches', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { owner, repo } = req.params;
    const branches = await githubService.getRepositoryBranches(
      req.user.accessToken,
      owner,
      repo
    );

    res.json(branches);
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new branch
router.post('/repositories/:owner/:repo/branches', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      console.error('Branch creation failed: User not authenticated');
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { owner, repo } = req.params;
    const { branchName, fromBranch } = req.body;

    console.log('Branch creation request:', {
      owner,
      repo,
      branchName,
      fromBranch,
      user: req.user?.username
    });

    if (!branchName) {
      return res.status(400).json({ error: 'Branch name is required' });
    }

    if (!req.user?.accessToken) {
      console.error('Branch creation failed: No access token');
      return res.status(401).json({ error: 'GitHub access token not found' });
    }

    const branch = await githubService.createBranch(
      req.user.accessToken,
      owner,
      repo,
      branchName,
      fromBranch
    );

    res.status(201).json(branch);
  } catch (error) {
    console.error('Error in branch creation route:', {
      message: error.message,
      stack: error.stack,
      owner: req.params.owner,
      repo: req.params.repo,
      branchName: req.body.branchName
    });
    res.status(500).json({ error: error.message });
  }
});

// Get repository issues
router.get('/repositories/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = 'open', page = 1, per_page = 30 } = req.query;
    
    const issues = await githubService.getIssues(
      req.user.accessToken, 
      owner, 
      repo, 
      { state, page: parseInt(page), per_page: parseInt(per_page) }
    );
    
    res.json(issues);
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch issues',
      message: error.message 
    });
  }
});

// Get user's organizations
router.get('/user/orgs', async (req, res) => {
  try {
    const organizations = await githubService.getUserOrganizations(req.user.accessToken);
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch organizations',
      message: error.message 
    });
  }
});

// Get file content (specific path)
router.get('/repositories/:owner/:repo/file/*', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const path = req.params[0]; // Get the wildcard path
    
    const content = await githubService.getFileContent(
      req.user.accessToken,
      owner,
      repo,
      path
    );
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ 
      error: 'Failed to fetch file content',
      message: error.message 
    });
  }
});

// Get repository contents (directory listing)
router.get('/repositories/:owner/:repo/contents', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { path = '' } = req.query;
    
    const contents = await githubService.getRepositoryContents(
      req.user.accessToken,
      owner,
      repo,
      path
    );
    
    res.json(contents);
  } catch (error) {
    console.error('Error fetching repository contents:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repository contents',
      message: error.message 
    });
  }
});

module.exports = router;
