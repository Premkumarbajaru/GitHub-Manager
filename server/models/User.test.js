const mongoose = require('mongoose');
const User = require('./User');

describe('User Model', () => {
  it('creates a valid user', () => {
    const userData = {
      githubId: '123456',
      username: 'testuser',
      displayName: 'Test User',
      email: 'test@example.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/123',
      profileUrl: 'https://github.com/testuser',
      accessToken: 'github-token',
    };

    const user = new User(userData);

    expect(user.githubId).toBe('123456');
    expect(user.username).toBe('testuser');
    expect(user.email).toBe('test@example.com');
  });

  it('requires githubId field', () => {
    const user = new User({
      username: 'testuser',
    });

    const validationError = user.validateSync();
    expect(validationError.errors.githubId).toBeDefined();
  });

  it('requires username field', () => {
    const user = new User({
      githubId: '123456',
    });

    const validationError = user.validateSync();
    expect(validationError.errors.username).toBeDefined();
  });

  it('has timestamps enabled in schema', () => {
    const schema = User.schema;
    expect(schema.options.timestamps).toBe(true);
  });

  it('enforces unique githubId', async () => {
    const schema = User.schema;
    const githubIdPath = schema.path('githubId');
    
    expect(githubIdPath.options.unique).toBe(true);
  });

  it('has username field in schema', () => {
    const schema = User.schema;
    const usernamePath = schema.path('username');
    
    expect(usernamePath).toBeDefined();
    expect(usernamePath.instance).toBe('String');
  });
});
