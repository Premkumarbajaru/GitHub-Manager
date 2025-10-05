import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  it('renders login page correctly', () => {
    renderLogin();
    
    expect(screen.getAllByText(/GitHub PR Manager/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
  });

  it('displays GitHub CTA button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /Continue with GitHub/i })).toBeInTheDocument();
  });

  // OAuth flow is triggered via onClick handler now; no static link

  it('displays welcome message', () => {
    renderLogin();
    expect(screen.getByText(/Streamline your GitHub workflow/i)).toBeInTheDocument();
  });

  it('displays features list', () => {
    renderLogin();
    expect(screen.getAllByText(/Pull Request Management/i)).toHaveLength(2); // One in description, one in feature card
    expect(screen.getByText(/Real-time Sync/i)).toBeInTheDocument();
    expect(screen.getByText(/Team Collaboration/i)).toBeInTheDocument();
    expect(screen.getByText(/Time Tracking/i)).toBeInTheDocument();
  });
});
