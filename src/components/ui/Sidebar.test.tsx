import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('Sidebar', () => {
  it('renders all navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
    expect(screen.getByText('Claims')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    render(<Sidebar />);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-slate-800');
  });
});
