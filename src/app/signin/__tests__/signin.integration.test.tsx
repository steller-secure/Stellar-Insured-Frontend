import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInPage from '@/app/signin/page';
import { AuthProvider } from '@/components/auth-provider';
import { ToastProvider } from '@/components/ui/toast';
import * as freighterApi from '@stellar/freighter-api';

jest.mock('@stellar/freighter-api');

const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('SignIn Integration Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('completes full signin flow successfully', async () => {
    const user = userEvent.setup();
    
    // Register user first
    localStorage.setItem('stellar_insured_users', JSON.stringify({
      'GTEST123': { createdAt: Date.now() }
    }));

    // Mock Freighter responses
    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: true });
    (freighterApi.requestAccess as jest.Mock).mockResolvedValue({ address: 'GTEST123' });
    (freighterApi.signMessage as jest.Mock).mockResolvedValue({
      signedMessage: 'signed_message',
      signerAddress: 'GTEST123'
    });

    render(
      <AuthProvider>
        <ToastProvider>
          <SignInPage />
        </ToastProvider>
      </AuthProvider>
    );

    // Click sign in button
    const signInButton = await screen.findByRole('button', { name: /sign in/i });
    await user.click(signInButton);

    // Wait for wallet connection and signing
    await waitFor(() => {
      expect(freighterApi.isConnected).toHaveBeenCalled();
      expect(freighterApi.requestAccess).toHaveBeenCalled();
      expect(freighterApi.signMessage).toHaveBeenCalled();
    });

    // Verify session was created
    await waitFor(() => {
      const session = localStorage.getItem('stellar_insured_session');
      expect(session).toBeTruthy();
      const parsed = JSON.parse(session!);
      expect(parsed.address).toBe('GTEST123');
    });

    // Verify redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows error when user not registered', async () => {
    const user = userEvent.setup();

    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: true });
    (freighterApi.requestAccess as jest.Mock).mockResolvedValue({ address: 'GUNREGISTERED' });

    render(
      <AuthProvider>
        <ToastProvider>
          <SignInPage />
        </ToastProvider>
      </AuthProvider>
    );

    const signInButton = await screen.findByRole('button', { name: /sign in/i });
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/No account found/i)).toBeInTheDocument();
    });
  });

  it('handles wallet connection error', async () => {
    const user = userEvent.setup();

    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ error: 'Connection failed' });

    render(
      <AuthProvider>
        <ToastProvider>
          <SignInPage />
        </ToastProvider>
      </AuthProvider>
    );

    const signInButton = await screen.findByRole('button', { name: /sign in/i });
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
    });
  });

  it('handles user rejection of signature', async () => {
    const user = userEvent.setup();

    localStorage.setItem('stellar_insured_users', JSON.stringify({
      'GTEST123': { createdAt: Date.now() }
    }));

    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: true });
    (freighterApi.requestAccess as jest.Mock).mockResolvedValue({ address: 'GTEST123' });
    (freighterApi.signMessage as jest.Mock).mockResolvedValue({ error: 'User rejected' });

    render(
      <AuthProvider>
        <ToastProvider>
          <SignInPage />
        </ToastProvider>
      </AuthProvider>
    );

    const signInButton = await screen.findByRole('button', { name: /sign in/i });
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText(/User rejected/i)).toBeInTheDocument();
    });
  });
});
