import { render, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/components/auth-provider';
import { ProtectedRoute } from '@/components/protected-route';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/protected',
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it('renders children when authenticated', () => {
    localStorage.setItem('stellar_insured_session', JSON.stringify({
      address: 'GTEST123',
      signedMessage: 'signed',
      signerAddress: 'GTEST123',
      authenticatedAt: Date.now()
    }));

    const { container } = render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it('handles unauthenticated state', async () => {
    render(
      <AuthProvider>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });
});
