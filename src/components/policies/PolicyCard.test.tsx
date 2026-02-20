import { render, screen } from '@testing-library/react';
import { PolicyCard } from '@/components/policies/PolicyCard';
import { Policy } from '@/types/policy';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('PolicyCard', () => {
  const mockPolicy: Policy = {
    id: '1',
    name: 'Test Policy',
    status: 'active',
    coverage: 50000,
    premium: 100,
    expiryDate: 'Dec 31, 2026',
    policyId: 'POL-2026-001',
    description: 'Test policy description',
    terms: ['Term 1', 'Term 2'],
  };

  it('renders policy information correctly', () => {
    render(<PolicyCard policy={mockPolicy} />);
    
    expect(screen.getByText('Test Policy')).toBeInTheDocument();
    expect(screen.getByText('POL-2026-001')).toBeInTheDocument();
    expect(screen.getByText(/50,?000/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('displays active status badge', () => {
    render(<PolicyCard policy={mockPolicy} />);
    
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it('displays pending status badge', () => {
    const pendingPolicy = { ...mockPolicy, status: 'pending' as const };
    render(<PolicyCard policy={pendingPolicy} />);
    
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });

  it('displays expired status badge', () => {
    const expiredPolicy = { ...mockPolicy, status: 'expired' as const };
    render(<PolicyCard policy={expiredPolicy} />);
    
    expect(screen.getByText(/expired/i)).toBeInTheDocument();
  });

  it('shows expiry date', () => {
    render(<PolicyCard policy={mockPolicy} />);
    
    expect(screen.getByText(/Dec 31, 2026/)).toBeInTheDocument();
  });
});
