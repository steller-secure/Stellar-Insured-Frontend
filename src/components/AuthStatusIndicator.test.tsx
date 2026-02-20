import { render, screen } from '@testing-library/react';
import { AuthStatusIndicator } from './AuthStatusIndicator';
import { AuthProvider } from './auth-provider';

describe('AuthStatusIndicator', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows connect wallet message when no session', () => {
    render(
      <AuthProvider>
        <AuthStatusIndicator />
      </AuthProvider>
    );
    expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument();
  });

  it('shows address when session exists', () => {
    localStorage.setItem(
      'stellar_insured_session',
      JSON.stringify({
        address: 'GTEST123',
        signedMessage: 'signed',
        signerAddress: 'GTEST123',
        authenticatedAt: Date.now(),
      })
    );

    render(
      <AuthProvider>
        <AuthStatusIndicator />
      </AuthProvider>
    );

    expect(screen.getByText(/GTEST/i)).toBeInTheDocument();
  });
});
