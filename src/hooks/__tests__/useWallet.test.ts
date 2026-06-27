import { renderHook, act, waitFor } from '@testing-library/react';
import { useWallet } from '../useWallet';
import { useWalletStore } from '@/store';
import { connectFreighter, signFreighterMessage, createAuthMessage } from '@/lib/freighter';
import { errorHandler } from '@/lib/errorHandler';

// ── Mocks ───────────────────────────────────────────────────
jest.mock('@/store', () => ({ useWalletStore: jest.fn() }));
jest.mock('@/lib/freighter', () => ({
  connectFreighter: jest.fn(),
  signFreighterMessage: jest.fn(),
  createAuthMessage: jest.fn(),
}));
jest.mock('@/lib/errorHandler', () => ({
  errorHandler: { createError: jest.fn(() => ({ message: 'error', userActionable: true })) },
}));
jest.mock('@/hooks/useErrorHandler', () => ({
  useWalletErrorHandler: jest.fn(() => ({
    executeWithErrorHandling: jest.fn((fn) => fn()),
    handleError: jest.fn(),
    showSuccessNotification: jest.fn(),
    showErrorNotification: jest.fn(),
    retryLastOperation: jest.fn(),
    hasError: false,
    canRetry: false,
  })),
}));

const mockConnectFreighter = connectFreighter as jest.Mock;
const mockSignFreighterMessage = signFreighterMessage as jest.Mock;
const mockCreateAuthMessage = createAuthMessage as jest.Mock;
const mockUseWalletStore = useWalletStore as jest.MockedFunction<typeof useWalletStore>;

const makeWalletStoreMock = (overrides: Record<string, unknown> = {}) => ({
  status: 'disconnected',
  session: null,
  error: null,
  setStatus: jest.fn(),
  setSession: jest.fn(),
  setError: jest.fn(),
  signOut: jest.fn(),
  isAddressRegistered: jest.fn(() => false),
  registerAddress: jest.fn(),
  getRegisteredUser: jest.fn(),
  startConnection: jest.fn(),
  completeConnection: jest.fn(),
  failConnection: jest.fn(),
  ...overrides,
});

describe('useWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseWalletStore.mockReturnValue(makeWalletStoreMock() as any);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ──────────────────────────────────────────────────────────
  // Initial State
  // ──────────────────────────────────────────────────────────
  describe('Initial State', () => {
    it('exposes status, session, and address from the store', () => {
      const { result } = renderHook(() => useWallet());

      expect(result.current.status).toBe('disconnected');
      expect(result.current.session).toBeNull();
      expect(result.current.address).toBeUndefined();
    });

    it('exposes address from active session', () => {
      mockUseWalletStore.mockReturnValue(
        makeWalletStoreMock({
          status: 'connected',
          session: { address: 'GABCXYZ', expiresAt: Date.now() + 86400000 },
        }) as any
      );

      const { result } = renderHook(() => useWallet());

      expect(result.current.address).toBe('GABCXYZ');
    });
  });

  // ──────────────────────────────────────────────────────────
  // connectWallet
  // ──────────────────────────────────────────────────────────
  describe('connectWallet()', () => {
    it('returns existing session without reconnecting', async () => {
      const existingSession = { address: 'GABC', expiresAt: Date.now() + 86400000 };
      mockUseWalletStore.mockReturnValue(
        makeWalletStoreMock({ session: existingSession }) as any
      );

      const { result } = renderHook(() => useWallet());

      let returned: unknown;
      await act(async () => { returned = await result.current.connectWallet(); });

      expect(returned).toEqual(existingSession);
      expect(mockConnectFreighter).not.toHaveBeenCalled();
    });

    it('goes through full connection flow when no session exists', async () => {
      const address = 'GNEWADDRESS';
      const message = 'auth-msg';
      const signedMessage = 'signed-msg';

      mockConnectFreighter.mockResolvedValue(address);
      mockCreateAuthMessage.mockReturnValue({ message });
      mockSignFreighterMessage.mockResolvedValue({
        signedMessage,
        signerAddress: address,
      });

      const storeMock = makeWalletStoreMock({ session: null });
      mockUseWalletStore.mockReturnValue(storeMock as any);

      // Wrap executeWithErrorHandling to actually call the fn
      const { useWalletErrorHandler } = require('@/hooks/useErrorHandler');
      useWalletErrorHandler.mockReturnValue({
        executeWithErrorHandling: jest.fn((fn: () => unknown) => fn()),
        showSuccessNotification: jest.fn(),
        showErrorNotification: jest.fn(),
        handleError: jest.fn(),
        hasError: false,
        canRetry: false,
      });

      const { result } = renderHook(() => useWallet());

      await act(async () => { await result.current.connectWallet(); });

      expect(storeMock.startConnection).toHaveBeenCalled();
      expect(mockConnectFreighter).toHaveBeenCalled();
      expect(mockCreateAuthMessage).toHaveBeenCalledWith(address);
      expect(mockSignFreighterMessage).toHaveBeenCalledWith(address, message);
      expect(storeMock.completeConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          address,
          signedMessage,
          signerAddress: address,
        })
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  // disconnect
  // ──────────────────────────────────────────────────────────
  describe('disconnect()', () => {
    it('calls signOut on disconnect', () => {
      const storeMock = makeWalletStoreMock();
      mockUseWalletStore.mockReturnValue(storeMock as any);

      const { result } = renderHook(() => useWallet());

      act(() => { result.current.disconnect(); });

      expect(storeMock.signOut).toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────
  // Session Expiry
  // ──────────────────────────────────────────────────────────
  describe('Session Expiry', () => {
    it('auto signs out when session is already expired on mount', () => {
      const expiredSession = {
        address: 'GABC',
        expiresAt: Date.now() - 1000, // already expired
      };
      const storeMock = makeWalletStoreMock({ session: expiredSession });
      mockUseWalletStore.mockReturnValue(storeMock as any);

      renderHook(() => useWallet());

      expect(storeMock.signOut).toHaveBeenCalled();
    });

    it('auto signs out when session expires in the future', async () => {
      const expiresIn = 5000; // 5 seconds
      const session = {
        address: 'GABC',
        expiresAt: Date.now() + expiresIn,
      };
      const storeMock = makeWalletStoreMock({ session });
      mockUseWalletStore.mockReturnValue(storeMock as any);

      renderHook(() => useWallet());

      expect(storeMock.signOut).not.toHaveBeenCalled();

      act(() => { jest.advanceTimersByTime(expiresIn + 100); });

      expect(storeMock.signOut).toHaveBeenCalled();
    });

    it('clears the expiry timer on unmount', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const session = {
        address: 'GABC',
        expiresAt: Date.now() + 60000,
      };
      mockUseWalletStore.mockReturnValue(makeWalletStoreMock({ session }) as any);

      const { unmount } = renderHook(() => useWallet());

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('does nothing when session has no expiresAt', () => {
      const session = { address: 'GABC' }; // no expiresAt
      const storeMock = makeWalletStoreMock({ session });
      mockUseWalletStore.mockReturnValue(storeMock as any);

      renderHook(() => useWallet());

      act(() => { jest.advanceTimersByTime(100000); });

      expect(storeMock.signOut).not.toHaveBeenCalled();
    });
  });
});
