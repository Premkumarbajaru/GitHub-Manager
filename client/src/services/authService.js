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

const API_URL = getApiUrl();

// Debug logging
console.log('AuthService API URL:', API_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

class AuthService {
  constructor() {
    this.api = {
      get: async (url, config = {}) => {
        const response = await fetch(`${API_URL}${url}`, {
          ...config,
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(config.headers || {})
          }
        });
        return this.handleResponse(response);
      },
      post: async (url, data = {}, config = {}) => {
        const response = await fetch(`${API_URL}${url}`, {
          ...config,
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...(config.headers || {})
          },
          body: JSON.stringify(data)
        });
        return this.handleResponse(response);
      }
    };
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        // Return a resolved promise for 401 errors
        return { data: { authenticated: false, user: null } };
      }
      
      const error = new Error(data.message || 'An error occurred');
      error.response = { data, status: response.status };
      throw error;
    }

    return { data };
  }

  async getAuthStatus() {
    try {
      console.log('Making auth status request to:', `${API_URL}/auth/status`);
      const response = await this.api.get('/auth/status');
      console.log('Auth status response:', response.data);
      // If we get here, the request was successful
      return response.data || { authenticated: false, user: null };
    } catch (error) {
      console.error('Auth status check failed:', error);
      // Handle network errors or other exceptions
      if (error.response?.status === 401) {
        return { authenticated: false, user: null };
      }
      return { authenticated: false, user: null };
    }
  }

  async logout() {
    try {
      const response = await this.api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  // Get GitHub OAuth URL
  getGitHubAuthUrl() {
    const authUrl = `${API_URL}/auth/github`;
    console.log('GitHub OAuth URL:', authUrl);
    return authUrl;
  }
}

export const authService = new AuthService();
