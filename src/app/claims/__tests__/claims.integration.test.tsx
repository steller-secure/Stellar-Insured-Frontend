import { render, screen } from '@testing-library/react';
import ClaimsPage from '@/app/claims/page';
import { AuthProvider } from '@/components/auth-provider-enhanced';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/claims',
}));

describe('Claims Integration Flow', () => {
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

  it('renders claims page', () => {
    render(
      <AuthProvider>
        <ClaimsPage />
      </AuthProvider>
    );

    expect(screen.getByText('Claims')).toBeInTheDocument();
  });

  it('shows page description', () => {
    render(
      <AuthProvider>
        <ClaimsPage />
      </AuthProvider>
    );

    expect(screen.getByText(/Manage and track your insurance claims/i)).toBeInTheDocument();
  });

  it('displays connected wallet status', () => {
    render(
      <AuthProvider>
        <ClaimsPage />
      </AuthProvider>
    );

    expect(screen.getByText(/Connected:/i)).toBeInTheDocument();
  });
});
