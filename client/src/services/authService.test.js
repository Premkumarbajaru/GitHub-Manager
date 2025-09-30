import { authService } from './authService';
import axios from 'axios';

jest.mock('axios');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Create a mock axios instance
    const mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    };
    axios.create.mockReturnValue(mockAxiosInstance);
  });

  describe('getAuthStatus', () => {
    it('returns authentication service methods', () => {
      expect(authService).toBeDefined();
      expect(typeof authService.getAuthStatus).toBe('function');
      expect(typeof authService.logout).toBe('function');
    });
  });

  describe('logout', () => {
    it('provides logout functionality', () => {
      expect(typeof authService.logout).toBe('function');
    });
  });

  // No getLoginUrl on authService; login URL is handled via routes/UI
});