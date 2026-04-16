import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from '../components/common/Avatar';

describe('Avatar', () => {
  it('renders initials from name', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders single initial for single-word name', () => {
    render(<Avatar name="Alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { container } = render(<Avatar name="Test User" size="lg" />);
    expect(container.firstChild).toHaveClass('w-12');
  });

  it('renders without crashing when name is empty', () => {
    const { container } = render(<Avatar name="" />);
    expect(container.firstChild).toBeTruthy();
  });
});
