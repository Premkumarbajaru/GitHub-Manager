import axios from 'axios';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getAuthStatus() {
    const response = await this.api.get('/auth/status');
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }
}

export const authService = new AuthService();
