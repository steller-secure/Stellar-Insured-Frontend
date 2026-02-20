import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import { ReactNode } from 'react';

const TestComponent = () => {
  const { session, setSession, signOut, isAddressRegistered, registerAddress } = useAuth();
  
  return (
    <div>
      <div data-testid="session-status">{session ? 'authenticated' : 'unauthenticated'}</div>
      {session && <div data-testid="session-address">{session.address}</div>}
      <button onClick={() => setSession({
        address: 'GTEST123',
        signedMessage: 'signed',
        signerAddress: 'GTEST123',
        authenticatedAt: Date.now()
      })}>Sign In</button>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={() => registerAddress('GTEST123')}>Register</button>
      <div data-testid="is-registered">{isAddressRegistered('GTEST123') ? 'yes' : 'no'}</div>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = '';
  });

  it('provides initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('session-status')).toHaveTextContent('unauthenticated');
  });

  it('allows setting session', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await user.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      expect(screen.getByTestId('session-status')).toHaveTextContent('authenticated');
      expect(screen.getByTestId('session-address')).toHaveTextContent('GTEST123');
    });
  });

  it('persists session to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await user.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      const stored = localStorage.getItem('stellar_insured_session');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.address).toBe('GTEST123');
    });
  });

  it('allows signing out', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await user.click(screen.getByText('Sign In'));
    await waitFor(() => expect(screen.getByTestId('session-status')).toHaveTextContent('authenticated'));
    
    await user.click(screen.getByText('Sign Out'));
    
    await waitFor(() => {
      expect(screen.getByTestId('session-status')).toHaveTextContent('unauthenticated');
      expect(localStorage.getItem('stellar_insured_session')).toBeNull();
    });
  });

  it('registers and checks addresses', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('is-registered')).toHaveTextContent('no');
    
    await user.click(screen.getByText('Register'));
    
    // Force re-render by triggering state update
    await user.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      const registered = localStorage.getItem('stellar_insured_users');
      expect(registered).toBeTruthy();
    });
  });

  it('throws error when useAuth used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within AuthProvider');
    
    consoleError.mockRestore();
  });
});
