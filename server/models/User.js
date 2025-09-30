const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  avatarUrl: {
    type: String,
    required: false
  },
  profileUrl: {
    type: String,
    required: false
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: false
  },
  publicRepos: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ githubId: 1 });
userSchema.index({ username: 1 });

// Instance method to get public user data
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    email: this.email,
    avatarUrl: this.avatarUrl,
    profileUrl: this.profileUrl,
    publicRepos: this.publicRepos,
    followers: this.followers,
    following: this.following,
    lastLogin: this.lastLogin
  };
};

// Static method to find user by GitHub ID
userSchema.statics.findByGithubId = function(githubId) {
  return this.findOne({ githubId });
};

module.exports = mongoose.model('User', userSchema);
