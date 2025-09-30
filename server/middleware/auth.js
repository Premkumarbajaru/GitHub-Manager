// Authentication middleware
const requireAuth = (req, res, next) => {
  const isAuthenticated = typeof req.isAuthenticated === 'function'
    ? req.isAuthenticated()
    : Boolean(req.user);
  if (isAuthenticated) {
    return next();
  }
  
  res.status(401).json({ 
    error: 'Authentication required',
    message: 'Please log in to access this resource'
  });
};

// Optional authentication middleware (doesn't block if not authenticated)
const optionalAuth = (req, res, next) => {
  // Always proceed, authentication is optional
  next();
};

// Admin middleware (for future use)
const requireAdmin = (req, res, next) => {
  const isAuthenticated = typeof req.isAuthenticated === 'function'
    ? req.isAuthenticated()
    : Boolean(req.user);
  if (!isAuthenticated) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  // Add admin check logic here if needed
  // For now, all authenticated users have access
  next();
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin
};
