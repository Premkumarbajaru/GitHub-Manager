const { requireAuth } = require('./auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      isAuthenticated: jest.fn(),
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('calls next() for authenticated users', () => {
    req.isAuthenticated.mockReturnValue(true);
    req.user = { id: '123', username: 'testuser' };

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 for unauthenticated users', () => {
    req.isAuthenticated.mockReturnValue(false);

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('handles missing isAuthenticated method', () => {
    delete req.isAuthenticated;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
