import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with different sizes', () => {
    const { rerender, container } = render(<LoadingSpinner size="sm" />);
    expect(container.querySelector('.h-4')).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" />);
    expect(container.querySelector('.h-12')).toBeInTheDocument();
  });

  it('renders different variants', () => {
    const { rerender } = render(<LoadingSpinner variant="spinner" />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<LoadingSpinner variant="dots" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
