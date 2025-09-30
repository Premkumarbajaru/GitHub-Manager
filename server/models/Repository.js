const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  githubId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  owner: {
    login: String,
    id: Number,
    avatarUrl: String
  },
  description: {
    type: String,
    default: ''
  },
  private: {
    type: Boolean,
    default: false
  },
  htmlUrl: {
    type: String,
    required: true
  },
  cloneUrl: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: null
  },
  stargazersCount: {
    type: Number,
    default: 0
  },
  watchersCount: {
    type: Number,
    default: 0
  },
  forksCount: {
    type: Number,
    default: 0
  },
  openIssuesCount: {
    type: Number,
    default: 0
  },
  defaultBranch: {
    type: String,
    default: 'main'
  },
  topics: [{
    type: String
  }],
  license: {
    key: String,
    name: String,
    spdxId: String
  },
  createdAt: {
    type: Date,
    required: true
  },
  updatedAt: {
    type: Date,
    required: true
  },
  pushedAt: {
    type: Date,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
repositorySchema.index({ githubId: 1 });
repositorySchema.index({ userId: 1 });
repositorySchema.index({ fullName: 1 });
repositorySchema.index({ name: 'text', description: 'text' });

// Static method to find repositories by user
repositorySchema.statics.findByUserId = function(userId) {
  return this.find({ userId }).sort({ updatedAt: -1 });
};

// Static method to search repositories
repositorySchema.statics.searchByName = function(userId, searchTerm) {
  return this.find({
    userId,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { fullName: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ updatedAt: -1 });
};

module.exports = mongoose.model('Repository', repositorySchema);
