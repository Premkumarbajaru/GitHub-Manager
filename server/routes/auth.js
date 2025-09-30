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
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error&message=${req.query.error_description || req.query.error}`);
    }
    
    passport.authenticate('github', { 
      failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
      failureFlash: false
    })(req, res, next);
  },
  (req, res) => {
    // Successful authentication
    console.log('Authentication successful for user:', req.user?.username);
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
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
