import '@testing-library/jest-dom';

// Store original console methods
const originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
};

// Suppress expected warnings and errors
beforeAll(() => {
  // Suppress React 18 act() warnings
  global.IS_REACT_ACT_ENVIRONMENT = true;

  // Suppress specific console.errors
  console.error = (...args) => {
    const msg = String(args[0] || '');
    const suppressedErrors = [
      'Auth status check failed:',
      'Cross origin',
      'Network Error',
      'act(',
      'React Router Future Flag Warning',
    ];

    if (!suppressedErrors.some(suppressed => msg.includes(suppressed))) {
      originalConsole.error(...args);
    }
  };

  // Suppress specific console.warns
  console.warn = (...args) => {
    const msg = String(args[0] || '');
    const suppressedWarnings = [
      'React Router Future Flag Warning',
      'A component is changing an uncontrolled input',
    ];

    if (!suppressedWarnings.some(suppressed => msg.includes(suppressed))) {
      originalConsole.warn(...args);
    }
  };

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
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
    unobserve() {}
    takeRecords() { return []; }
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.log = originalConsole.log;
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
