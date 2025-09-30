const express = require('express');
const passport = require('passport');
const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working!', timestamp: new Date().toISOString() });
});

// GitHub OAuth login
router.get('/github', (req, res, next) => {
  console.log('GitHub OAuth initiated with scopes: repo, user:email, read:org');
  
  // Store the returnTo URL in session if provided
  if (req.query.returnTo) {
    req.session.returnTo = req.query.returnTo;
  }
  
  passport.authenticate('github', { 
    scope: ['repo', 'user:email', 'read:org'] 
  })(req, res, next);
});

// GitHub OAuth callback
router.get('/github/callback', 
  (req, res, next) => {
    console.log('GitHub callback received:', req.query);
    
    // Check for error in callback
    if (req.query.error) {
      console.error('GitHub OAuth error:', req.query.error, req.query.error_description);
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_error&message=${encodeURIComponent(req.query.error_description || req.query.error)}`);
    }
    
    // Get the returnTo URL from session or use default
    const defaultReturnTo = `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`;
    const returnTo = req.session.returnTo || defaultReturnTo;
    
    // Clear the returnTo from session
    if (req.session.returnTo) {
      delete req.session.returnTo;
    }
    
    // Log the redirect URL for debugging
    console.log('Redirecting after successful auth to:', returnTo);
    
    // Use a custom callback to handle the authentication
    passport.authenticate('github', { 
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`,
      failureFlash: false,
      session: true
    }, (err, user, info) => {
      if (err) {
        console.error('Authentication error:', err);
        return next(err);
      }
      if (!user) {
        console.error('Authentication failed:', info);
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_failed`);
      }
      
      // Log in the user
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return next(err);
        }
        
        // Successful authentication, redirect to the return URL
        console.log('Authentication successful for user:', user.username);
        return res.redirect(returnTo);
      });
    })(req, res, next);
  },
  // This should not be reached if the above works correctly
  (req, res) => {
    console.log('Fallback redirect for user:', req.user?.username);
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ error: 'Failed to destroy session' });
      }
      
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ 
      authenticated: true, 
      user: req.user.getPublicProfile() 
    });
  } else {
    res.status(401).json({ 
      authenticated: false, 
      user: null 
    });
  }
});

module.exports = router;
