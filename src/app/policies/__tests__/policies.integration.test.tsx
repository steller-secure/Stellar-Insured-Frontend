import { render, screen } from '@testing-library/react';
import PoliciesPage from '@/app/policies/page';
import { AuthProvider } from '@/components/auth-provider-enhanced';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/policies',
}));

describe('Policy Discovery Integration Flow', () => {
  beforeEach(() => {
    localStorage.setItem('stellar_insured_session', JSON.stringify({
      address: 'GTEST123',
      signedMessage: 'signed',
      signerAddress: 'GTEST123',
      authenticatedAt: Date.now()
    }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders policies page', () => {
    render(
      <AuthProvider>
        <PoliciesPage />
      </AuthProvider>
    );

    expect(screen.getByText('My Policies')).toBeInTheDocument();
  });

  it('shows search input', () => {
    render(
      <AuthProvider>
        <PoliciesPage />
      </AuthProvider>
    );

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('displays policy tabs', () => {
    render(
      <AuthProvider>
        <PoliciesPage />
      </AuthProvider>
    );

    expect(screen.getByRole('button', { name: /all \(\d+\)/i })).toBeInTheDocument();
  });
});
