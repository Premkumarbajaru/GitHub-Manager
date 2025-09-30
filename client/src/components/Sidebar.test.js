import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Sidebar Component', () => {
  it('renders sidebar navigation', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('displays all navigation links', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText(/Repositories/i)).toBeInTheDocument();
    expect(screen.getByText(/Pull Requests/i)).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = renderWithRouter(<Sidebar />);
    expect(container).toBeInTheDocument();
  });
});
