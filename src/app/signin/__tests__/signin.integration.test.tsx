import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInPage from '@/app/signin/page';
import { AuthProvider } from '@/components/auth-provider';
import { ToastProvider } from '@/components/ui/toast';
import { useWalletStore } from '@/store';
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

// Must be a format-valid Stellar address (G + 55 base32 chars) so that
// AuthProvider's validateSessionFields() accepts the created session.
const REGISTERED_ADDRESS = 'G' + 'A'.repeat(55);
const UNREGISTERED_ADDRESS = 'G' + 'B'.repeat(55);

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText(/email address/i), 'test@example.com');
  await user.type(await screen.findByLabelText(/^password/i), 'password123');
  const signInButton = await screen.findByRole('button', { name: /sign in/i });
  await user.click(signInButton);
  return signInButton;
}

describe('SignIn Integration Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie = '';
    useWalletStore.getState().reset();
    jest.clearAllMocks();
    // Stub network calls (Horizon validation, blockchain event polling)
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });
  });

  it('completes full signin flow successfully', async () => {
    const user = userEvent.setup();

    // Register user first
    useWalletStore.getState().registerAddress(REGISTERED_ADDRESS, { createdAt: Date.now() });

    // Mock Freighter responses
    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: true });
    (freighterApi.requestAccess as jest.Mock).mockResolvedValue({ address: REGISTERED_ADDRESS });
    (freighterApi.signMessage as jest.Mock).mockResolvedValue({
      signedMessage: 'signed_message',
      signerAddress: REGISTERED_ADDRESS
    });

    render(
      <AuthProvider>
        <ToastProvider>
          <SignInPage />
        </ToastProvider>
      </AuthProvider>
    );

    await fillAndSubmit(user);

    // Wait for wallet connection and signing
    await waitFor(() => {
      expect(freighterApi.isConnected).toHaveBeenCalled();
      expect(freighterApi.requestAccess).toHaveBeenCalled();
      expect(freighterApi.signMessage).toHaveBeenCalled();
    });

    // Verify session was created
    await waitFor(() => {
      expect(useWalletStore.getState().session?.address).toBe(REGISTERED_ADDRESS);
    });

    // Verify redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows error when user not registered', async () => {
    const user = userEvent.setup();

    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: true });
    (freighterApi.requestAccess as jest.Mock).mockResolvedValue({ address: UNREGISTERED_ADDRESS });

    render(
      <AuthProvider>
        <ToastProvider>
          <SignInPage />
        </ToastProvider>
      </AuthProvider>
    );

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(document.body.textContent).toMatch(/No account found/i);
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

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(document.body.textContent).toMatch(/wallet error/i);
    });
  });

  it('handles user rejection of signature', async () => {
    const user = userEvent.setup();

    useWalletStore.getState().registerAddress(REGISTERED_ADDRESS, { createdAt: Date.now() });

    (freighterApi.isConnected as jest.Mock).mockResolvedValue({ isConnected: true });
    (freighterApi.requestAccess as jest.Mock).mockResolvedValue({ address: REGISTERED_ADDRESS });
    (freighterApi.signMessage as jest.Mock).mockResolvedValue({ error: 'User rejected' });

    render(
      <AuthProvider>
        <ToastProvider>
          <SignInPage />
        </ToastProvider>
      </AuthProvider>
    );

    await fillAndSubmit(user);

    await waitFor(() => {
      expect(document.body.textContent).toMatch(/rejected by wallet/i);
    });
  });
});