import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Don't log 401 errors as they're expected when not authenticated
        if (error.response?.status !== 401) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error:', error.response.data);
            console.error('Status:', error.response.status);
          } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async getAuthStatus() {
    try {
      const response = await this.api.get('/auth/status', {
        // Don't throw on 401 status as it's expected when not authenticated
        validateStatus: (status) => status === 200 || status === 401
      });
      
      // If we get a 401, return unauthenticated state
      if (response.status === 401) {
        return { authenticated: false, user: null };
      }
      
      return response.data;
    } catch (error) {
      console.error('Auth status check failed:', error);
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
    return `${API_URL}/auth/github`;
  }
}

export const authService = new AuthService();
