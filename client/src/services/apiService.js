import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // If REACT_APP_API_URL is set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // In production, use the Render backend URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://github-manager-9hf4.onrender.com';
  }
  
  // Development fallback
  return 'http://localhost:5000';
};

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: getApiUrl(),
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Only redirect to login if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // User endpoints
  async getCurrentUser() {
    const response = await this.api.get('/api/user');
    return response.data;
  }

  // Repository endpoints
  async getRepositories(params = {}) {
    const response = await this.api.get('/api/repositories', { params });
    return response.data;
  }

  async getRepository(owner, repo) {
    const response = await this.api.get(`/api/repositories/${owner}/${repo}`);
    return response.data;
  }

  // Pull request endpoints
  async getPullRequests(owner, repo, params = {}) {
    const response = await this.api.get(`/api/repositories/${owner}/${repo}/pulls`, { params });
    return response.data;
  }

  async getPullRequest(owner, repo, number) {
    const response = await this.api.get(`/api/repositories/${owner}/${repo}/pulls/${number}`);
    return response.data;
  }

  async getPullRequestComments(owner, repo, number, params = {}) {
    const response = await this.api.get(`/api/repositories/${owner}/${repo}/pulls/${number}/comments`, { params });
    return response.data;
  }

  async addPullRequestComment(owner, repo, pullNumber, body) {
    try {
      const response = await this.api.post(`/api/repositories/${owner}/${repo}/pulls/${pullNumber}/comments`, {
        body
      });
      return response.data;
    } catch (error) {
      console.error('API Service Comment Error:', {
        message: error.message,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  async createPullRequest(owner, repo, pullRequestData) {
    const response = await this.api.post(`/api/repositories/${owner}/${repo}/pulls`, pullRequestData);
    return response.data;
  }

  async getRepositoryBranches(owner, repo) {
    const response = await this.api.get(`/api/repositories/${owner}/${repo}/branches`);
    return response.data;
  }

  async createBranch(owner, repo, branchName, fromBranch = 'main') {
    const response = await this.api.post(`/api/repositories/${owner}/${repo}/branches`, {
      branchName,
      fromBranch
    });
    return response.data;
  }

  // Issues endpoints
  async getIssues(owner, repo, params = {}) {
    const response = await this.api.get(`/api/repositories/${owner}/${repo}/issues`, { params });
    return response.data;
  }

  // Organizations endpoints
  async getUserOrganizations() {
    const response = await this.api.get('/api/user/orgs');
    return response.data;
  }

  // Repository contents endpoints
  async getRepositoryContents(owner, repo, path = '') {
    const response = await this.api.get(`/api/repositories/${owner}/${repo}/contents`, {
      params: { path }
    });
    return response.data;
  }

  async getFileContent(owner, repo, path) {
    const response = await this.api.get(`/api/repositories/${owner}/${repo}/file/${path}`);
    return response.data;
  }
}

const apiService = new ApiService();
export { apiService };
export default apiService;
