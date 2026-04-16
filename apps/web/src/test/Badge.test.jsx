import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, RoleBadge, LeaveBadge } from '../components/common/Badge';

describe('StatusBadge', () => {
  it('renders active status', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders pending status', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders approved status', () => {
    render(<StatusBadge status="approved" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
});

describe('RoleBadge', () => {
  it('renders admin role', () => {
    render(<RoleBadge role="admin" />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders hr role', () => {
    render(<RoleBadge role="hr" />);
    expect(screen.getByText('Hr')).toBeInTheDocument();
  });
});

describe('LeaveBadge', () => {
  it('renders annual leave type', () => {
    render(<LeaveBadge type="annual" />);
    expect(screen.getByText('Annual')).toBeInTheDocument();
  });

  it('renders sick leave type', () => {
    render(<LeaveBadge type="sick" />);
    expect(screen.getByText('Sick')).toBeInTheDocument();
  });
});
