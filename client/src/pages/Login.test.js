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
    expect(screen.getByText(/Where Code Meets Collaboration/i)).toBeInTheDocument();
  });

  it('displays features list', () => {
    renderLogin();
    expect(screen.getByText(/Lightning Fast/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure OAuth/i)).toBeInTheDocument();
  });
});
