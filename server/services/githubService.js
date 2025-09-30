const axios = require('axios');

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
  }

  // Create axios instance with authentication
  createAuthenticatedClient(accessToken) {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `token ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-PR-Manager'
      }
    });
  }

  // Get user repositories
  async getUserRepositories(accessToken, options = {}) {
    const client = this.createAuthenticatedClient(accessToken);
    const { search, page = 1, per_page = 30, sort = 'updated', type = 'all' } = options;
    
    try {
      let url = '/user/repos';
      const params = {
        sort: sort === 'stargazers_count' ? 'updated' : sort, // GitHub API doesn't support sorting by stars for user repos
        direction: sort === 'full_name' ? 'asc' : 'desc',
        page,
        per_page,
        type: type === 'all' ? 'all' : type
      };

      if (search) {
        // Use search API for searching repositories
        url = '/search/repositories';
        params.q = `user:${await this.getCurrentUser(accessToken).then(user => user.login)} ${search}`;
        delete params.type;
        delete params.sort;
        delete params.direction;
      }

      const response = await client.get(url, { params });
      
      // Handle search API response format
      if (search) {
        return {
          repositories: response.data.items,
          total_count: response.data.total_count,
          page,
          per_page
        };
      }
      
      return {
        repositories: response.data,
        page,
        per_page
      };
    } catch (error) {
      console.error('Error fetching repositories:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get current authenticated user
  async getCurrentUser(accessToken) {
    const client = this.createAuthenticatedClient(accessToken);
    
    try {
      const response = await client.get('/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get specific repository
  async getRepository(accessToken, owner, repo) {
    const client = this.createAuthenticatedClient(accessToken);
    
    try {
      const response = await client.get(`/repos/${owner}/${repo}`);
      const repoData = response.data;
      
      // Log repository permissions for debugging
      console.log('Repository permissions:', {
        owner: repoData.owner.login,
        name: repoData.name,
        permissions: repoData.permissions,
        can_push: repoData.permissions?.push,
        can_pull: repoData.permissions?.pull,
        can_admin: repoData.permissions?.admin
      });
      
      return repoData;
    } catch (error) {
      console.error('Error fetching repository:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get pull requests for a repository
  async getPullRequests(accessToken, owner, repo, options = {}) {
    const client = this.createAuthenticatedClient(accessToken);
    const { state = 'open', page = 1, per_page = 30 } = options;
    
    try {
      const response = await client.get(`/repos/${owner}/${repo}/pulls`, {
        params: {
          state,
          page,
          per_page,
          sort: 'updated',
          direction: 'desc'
        }
      });
      
      return {
        pull_requests: response.data,
        page,
        per_page
      };
    } catch (error) {
      console.error('Error fetching pull requests:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get specific pull request
  async getPullRequest(accessToken, owner, repo, number) {
    const client = this.createAuthenticatedClient(accessToken);
    
    try {
      const response = await client.get(`/repos/${owner}/${repo}/pulls/${number}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pull request:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get pull request comments
  async getPullRequestComments(accessToken, owner, repo, number, options = {}) {
    const client = this.createAuthenticatedClient(accessToken);
    const { page = 1, per_page = 30 } = options;
    
    try {
      const response = await client.get(`/repos/${owner}/${repo}/issues/${number}/comments`, {
        params: {
          page,
          per_page,
          sort: 'created',
          direction: 'asc'
        }
      });
      
      return {
        comments: response.data,
        page,
        per_page
      };
    } catch (error) {
      console.error('Error fetching PR comments:', error.response?.data || error.message);
      throw error;
    }
  }

  // Add comment to pull request
  async addPullRequestComment(accessToken, owner, repo, pullNumber, body) {
    const client = this.createAuthenticatedClient(accessToken);
    
    try {
      const response = await client.post(`/repos/${owner}/${repo}/issues/${pullNumber}/comments`, {
        body
      });
      
      return response.data;
    } catch (error) {
      console.error('Detailed PR comment error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        owner,
        repo,
        pullNumber,
        bodyLength: body.length
      });
      throw new Error(`Failed to add comment to pull request: ${error.response?.data?.message || error.message}`);
    }
  }

  // Create a new pull request
  async createPullRequest(accessToken, owner, repo, pullRequestData) {
    const client = this.createAuthenticatedClient(accessToken);
    
    try {
      // Check repository permissions first
      const repoResponse = await client.get(`/repos/${owner}/${repo}`);
      const repoData = repoResponse.data;
      
      console.log('Checking repository permissions before PR creation:', {
        owner: repoData.owner.login,
        name: repoData.name,
        permissions: repoData.permissions,
        can_push: repoData.permissions?.push
      });
      
      if (!repoData.permissions?.push) {
        throw new Error('You do not have push permissions to this repository. Pull requests require push access to create branches and commits.');
      }
      
      // If no base branch specified, use the default branch
      let baseBranch = pullRequestData.base;
      if (!baseBranch) {
        baseBranch = repoData.default_branch;
      }

      console.log('Creating pull request:', {
        owner,
        repo,
        title: pullRequestData.title,
        head: pullRequestData.head,
        base: baseBranch,
        draft: pullRequestData.draft
      });

      const response = await client.post(`/repos/${owner}/${repo}/pulls`, {
        title: pullRequestData.title,
        body: pullRequestData.body || '',
        head: pullRequestData.head, // branch name
        base: baseBranch, // target branch
        draft: pullRequestData.draft || false
      });
      
      console.log('Pull request created successfully:', response.data.number);
      return response.data;
    } catch (error) {
      console.error('Error creating PR:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        errors: error.response?.data?.errors,
        owner,
        repo,
        head: pullRequestData.head,
        base: pullRequestData.base
      });
      
      if (error.response?.status === 422) {
        const errorMessage = error.response.data?.message || 'Validation failed';
        const errors = error.response.data?.errors || [];
        
        // Log detailed error information
        console.error('GitHub API validation errors:', errors);
        
        // Check for specific error conditions
        if (errorMessage.includes('No commits between') || errors.some(err => err.message && err.message.includes('No commits between'))) {
          throw new Error('No commits found between the selected branches. Make sure the head branch has changes.');
        }
        if (errorMessage.includes('already exists')) {
          throw new Error('A pull request already exists for this branch.');
        }
        
        // Check for permission errors
        if (errors.some(err => err.message && err.message.includes('permission'))) {
          throw new Error('You do not have permission to create pull requests in this repository. Please check if you have write access.');
        }
        
        // Check for branch existence errors
        if (errors.some(err => err.message && err.message.includes('does not exist'))) {
          throw new Error('One of the specified branches does not exist. Please check the branch names.');
        }
        
        // Check for same branch error
        if (errors.some(err => err.message && err.message.includes('same'))) {
          throw new Error('The head and base branches cannot be the same.');
        }
        
        // Generic validation error with details
        const errorDetails = errors.map(err => err.message || err.code || 'Unknown error').join(', ');
        throw new Error(`Validation failed: ${errorDetails || errorMessage}`);
      }
      
      throw new Error(error.response?.data?.message || `Failed to create pull request: ${error.message}`);
    }
  }

  // Get repository branches
  async getRepositoryBranches(accessToken, owner, repo) {
    const client = this.createAuthenticatedClient(accessToken);
    
    try {
      const response = await client.get(`/repos/${owner}/${repo}/branches`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branches:', error.response?.data || error.message);
      throw new Error('Failed to fetch repository branches');
    }
  }

  // Create a new branch
  async createBranch(accessToken, owner, repo, branchName, fromBranch) {
    const client = this.createAuthenticatedClient(accessToken);
    
    try {
      // If no fromBranch specified, get the default branch
      if (!fromBranch) {
        const repoResponse = await client.get(`/repos/${owner}/${repo}`);
        fromBranch = repoResponse.data.default_branch;
      }
      
      console.log(`Creating branch "${branchName}" from "${fromBranch}" in ${owner}/${repo}`);
      
      // First get the SHA of the source branch
      const refResponse = await client.get(`/repos/${owner}/${repo}/git/refs/heads/${fromBranch}`);
      const sha = refResponse.data.object.sha;
      
      console.log(`Source branch SHA: ${sha}`);
      
      // Create new branch
      const response = await client.post(`/repos/${owner}/${repo}/git/refs`, {
        ref: `refs/heads/${branchName}`,
        sha: sha
      });
      
      console.log(`Branch created successfully: ${branchName}`);
      return response.data;
    } catch (error) {
      console.error('Error creating branch:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        branchName,
        fromBranch,
        owner,
        repo
      });
      
      if (error.response?.status === 422 && error.response?.data?.message?.includes('already exists')) {
        throw new Error(`Branch "${branchName}" already exists`);
      }
      
      throw new Error(error.response?.data?.message || `Failed to create branch: ${error.message}`);
    }
  }

  // Get repository issues
  async getIssues(accessToken, owner, repo, options = {}) {
    const client = this.createAuthenticatedClient(accessToken);
    const { state = 'open', page = 1, per_page = 30 } = options;
    
    try {
      const response = await client.get(`/repos/${owner}/${repo}/issues`, {
        params: {
          state,
          page,
          per_page,
          sort: 'updated',
          direction: 'desc'
        }
      });
      
      return {
        issues: response.data,
        page,
        per_page
      };
    } catch (error) {
      console.error('Error fetching issues:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get user organizations
  async getUserOrganizations(accessToken) {
    const client = this.createAuthenticatedClient(accessToken);
    
    try {
      const response = await client.get('/user/orgs');
      return response.data;
    } catch (error) {
      console.error('Error fetching organizations:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get repository contents
  async getRepositoryContents(accessToken, owner, repo, path = '') {
    const client = this.createAuthenticatedClient(accessToken);
    
    try {
      const response = await client.get(`/repos/${owner}/${repo}/contents/${path}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching repository contents:', error.response?.data || error.message);
      throw new Error('Failed to fetch repository contents');
    }
  }

  // Get file content
  async getFileContent(accessToken, owner, repo, path) {
    const client = this.createAuthenticatedClient(accessToken);
    
    try {
      const response = await client.get(`/repos/${owner}/${repo}/contents/${path}`);
      const content = response.data;
      
      if (content.type === 'file' && content.content) {
        // Decode base64 content
        content.decodedContent = Buffer.from(content.content, 'base64').toString('utf8');
      }
      
      return content;
    } catch (error) {
      console.error('Error fetching file content:', error.response?.data || error.message);
      throw new Error('Failed to fetch file content');
    }
  }

  // Get organization repositories
  async getOrganizationRepositories(accessToken, org, options = {}) {
    const client = this.createAuthenticatedClient(accessToken);
    const { page = 1, per_page = 30 } = options;
    
    try {
      const response = await client.get(`/orgs/${org}/repos`, {
        params: {
          page,
          per_page,
          sort: 'updated',
          direction: 'desc'
        }
      });
      
      return {
        repositories: response.data,
        page,
        per_page
      };
    } catch (error) {
      console.error('Error fetching org repositories:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new GitHubService();
