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
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_error&message=${encodeURIComponent(req.query.error_description || req.query.error)}`);
    }
    
    // Get the returnTo URL from session or use default
    const clientUrl = process.env.CLIENT_URL;
    const defaultReturnTo = `${clientUrl}/dashboard`;
    const returnTo = req.session.returnTo || defaultReturnTo;
    
    // Ensure no double slashes in the URL
    const cleanReturnTo = returnTo.replace(/([^:]\/)\/+/g, '$1');
    
    // Clear the returnTo from session
    if (req.session.returnTo) {
      delete req.session.returnTo;
    }
    
    // Log the redirect URL for debugging
    console.log('Redirecting after successful auth to:', cleanReturnTo);
    console.log('Client URL:', clientUrl);
    console.log('Original returnTo:', returnTo);
    
    // Use a custom callback to handle the authentication
    passport.authenticate('github', { 
      failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
      failureFlash: false,
      session: true
    }, (err, user, info) => {
      if (err) {
        console.error('Authentication error:', err);
        return next(err);
      }
      if (!user) {
        console.error('Authentication failed:', info);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }
      
      // Log in the user
      req.logIn(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return next(err);
        }
        
        // Successful authentication, redirect to the return URL
        console.log('Authentication successful for user:', user.username);
        return res.redirect(cleanReturnTo);
      });
    })(req, res, next);
  },
  // This should not be reached if the above works correctly
  (req, res) => {
    console.log('Fallback redirect for user:', req.user?.username);
    res.redirect(process.env.CLIENT_URL);
  }
);

// Logout
router.post('/logout', (req, res) => {
  // Store a reference to the session before destroying it
  const sessionId = req.sessionID;
  
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    
    // Manually clear the session store
    if (req.sessionStore && req.sessionStore.destroy) {
      req.sessionStore.destroy(sessionId, (err) => {
        if (err) {
          console.error('Session store destroy error:', err);
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        
        res.status(200).json({ message: 'Logged out successfully' });
      });
    } else {
      // Fallback if sessionStore.destroy is not available
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Failed to destroy session' });
        }
        
        res.clearCookie('connect.sid', {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });
        
        res.status(200).json({ message: 'Logged out successfully' });
      });
    }
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  try {
    if (req.isAuthenticated() && req.user) {
      return res.status(200).json({ 
        authenticated: true, 
        user: req.user.getPublicProfile ? req.user.getPublicProfile() : req.user
      });
    }
    
    // If not authenticated, return 200 with authenticated: false
    res.status(200).json({ 
      authenticated: false, 
      user: null 
    });
  } catch (error) {
    console.error('Error in /status endpoint:', error);
    res.status(200).json({ 
      authenticated: false, 
      user: null,
      error: 'Error checking authentication status'
    });
  }
});

module.exports = router;
