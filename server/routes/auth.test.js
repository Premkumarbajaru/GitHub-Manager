const request = require('supertest');
const express = require('express');

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock auth routes
    app.get('/auth/github', (req, res) => {
      res.redirect('https://github.com/login/oauth/authorize');
    });

    app.get('/auth/github/callback', (req, res) => {
      res.redirect('/');
    });

    app.get('/auth/status', (req, res) => {
      res.json({
        isAuthenticated: false,
        user: null,
      });
    });

    app.post('/auth/logout', (req, res) => {
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  describe('GET /auth/github', () => {
    it('redirects to GitHub OAuth', async () => {
      const response = await request(app).get('/auth/github');

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('github.com');
    });
  });

  describe('GET /auth/status', () => {
    it('returns unauthenticated status by default', async () => {
      const response = await request(app).get('/auth/status');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        isAuthenticated: false,
        user: null,
      });
    });
  });

  describe('POST /auth/logout', () => {
    it('logs out user successfully', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });
});