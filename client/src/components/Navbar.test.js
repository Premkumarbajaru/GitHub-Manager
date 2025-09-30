import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../utils/testUtils';
import Navbar from './Navbar';

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { username: 'testuser', avatarUrl: 'https://example.com/avatar.jpg' },
    logout: jest.fn(),
  }),
}));

describe('Navbar Component', () => {
  it('renders navbar', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText(/GitHub PR Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/@testuser/i)).toBeInTheDocument();
  });

  it('displays user avatar', () => {
    renderWithProviders(<Navbar />);
    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('handles logout click', () => {
    const mockLogout = jest.fn();
    jest.spyOn(require('../hooks/useAuth'), 'useAuth').mockReturnValue({
      user: { username: 'testuser' },
      logout: mockLogout,
    });

    renderWithProviders(<Navbar />);
    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });
});
