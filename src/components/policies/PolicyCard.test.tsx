import { render, screen } from '@testing-library/react';
import { PolicyCard } from '@/components/policies/PolicyCard';
import { Policy } from '@/types/api';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('PolicyCard', () => {
  const mockPolicy: Policy = {
    id: '1',
    name: 'Test Policy',
    type: 'Health',
    status: 'active',
    coverageLimit: 50000,
    coverageLimitFormatted: '50,000',
    premium: 100,
    expiryDate: 'Dec 31, 2026',
    policyNumber: 'POL-2026-001',
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
