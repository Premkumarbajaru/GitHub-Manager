const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// Log configuration details
console.log('Configuring GitHub OAuth with:', {
  clientID: process.env.GITHUB_CLIENT_ID ? '***' : 'Not set',
  hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
  nodeEnv: process.env.NODE_ENV || 'development',
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'Using dynamic URL based on environment'
});

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://github-manager-9hf4.onrender.com/auth/github/callback'
      : 'http://localhost:5000/auth/github/callback')
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('GitHub OAuth callback received for user:', profile.username);
    // Check if user already exists
    let existingUser = await User.findByGithubId(profile.id);
    
    if (existingUser) {
      // Update existing user with new tokens and profile data
      existingUser.accessToken = accessToken;
      existingUser.refreshToken = refreshToken;
      existingUser.displayName = profile.displayName || profile.username;
      existingUser.email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      existingUser.avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
      existingUser.profileUrl = profile.profileUrl;
      existingUser.publicRepos = profile._json.public_repos || 0;
      existingUser.followers = profile._json.followers || 0;
      existingUser.following = profile._json.following || 0;
      existingUser.lastLogin = new Date();
      
      await existingUser.save();
      return done(null, existingUser);
    }
    
    // Create new user
    const newUser = new User({
      githubId: profile.id,
      username: profile.username,
      displayName: profile.displayName || profile.username,
      email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
      avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
      profileUrl: profile.profileUrl,
      accessToken: accessToken,
      refreshToken: refreshToken,
      publicRepos: profile._json.public_repos || 0,
      followers: profile._json.followers || 0,
      following: profile._json.following || 0,
      lastLogin: new Date()
    });
    
    await newUser.save();
    return done(null, newUser);
    
  } catch (error) {
    console.error('Error in GitHub OAuth strategy:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

module.exports = passport;
