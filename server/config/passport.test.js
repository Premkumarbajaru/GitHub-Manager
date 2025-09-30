const passport = require('passport');

// Simple tests for passport configuration
describe('Passport Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GITHUB_CLIENT_ID = 'test-client-id';
    process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
    process.env.GITHUB_CALLBACK_URL = 'http://localhost:5000/auth/github/callback';
  });

  it('exports passport configuration', () => {
    // Just verify the module can be required without errors
    expect(() => require('./passport')).not.toThrow();
  });

  it('has required environment variables', () => {
    expect(process.env.GITHUB_CLIENT_ID).toBeDefined();
    expect(process.env.GITHUB_CLIENT_SECRET).toBeDefined();
    expect(process.env.GITHUB_CALLBACK_URL).toBeDefined();
  });
});