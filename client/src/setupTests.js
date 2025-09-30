// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Silence noisy console.error logs from jsdom network/CORS during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const msg = String(args[0] || '');
    if (
      msg.includes('Auth status check failed:') ||
      msg.includes('Cross origin') ||
      msg.includes('Network Error') ||
      msg.includes('act(')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock authService globally to avoid real network calls from AuthContext
jest.mock('./services/authService', () => ({
  __esModule: true,
  authService: {
    getAuthStatus: jest.fn().mockResolvedValue({ isAuthenticated: false, user: null }),
    logout: jest.fn().mockResolvedValue({ success: true }),
  },
  default: {
    getAuthStatus: jest.fn().mockResolvedValue({ isAuthenticated: false, user: null }),
    logout: jest.fn().mockResolvedValue({ success: true }),
    getLoginUrl: jest.fn(() => '/auth/github'),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};
