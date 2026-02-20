import { render, screen } from '@testing-library/react';
import { ClaimForm } from '@/components/claims/ClaimForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ClaimForm', () => {
  it('renders form fields', () => {
    render(<ClaimForm />);
    
    expect(screen.getByText(/Select Policy/i)).toBeInTheDocument();
    expect(screen.getByText(/Claim Amount/i)).toBeInTheDocument();
    expect(screen.getByText(/Incident Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Supporting Evidence/i)).toBeInTheDocument();
  });

  it('shows submit button', () => {
    render(<ClaimForm />);
    
    expect(screen.getByRole('button', { name: /submit claim/i })).toBeInTheDocument();
  });

  it('shows cancel button', () => {
    render(<ClaimForm />);
    
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});
