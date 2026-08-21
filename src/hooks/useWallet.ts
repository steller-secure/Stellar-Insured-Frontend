import { useCallback, useEffect } from 'react';
import { useWalletStore } from '@/store';
import { AuthSession } from '@/store/types';
import { connectFreighter, signFreighterMessage, createAuthMessage } from '@/lib/freighter';
import { useWalletErrorHandler } from '@/hooks/useErrorHandler';
import { errorHandler } from '@/lib/errorHandler';
import { blockchainEvents } from '@/lib/blockchainEvents';

/**
 * Wallet Connection Hook
 * 
 * Provides wallet connection functionality that integrates with the unified auth provider.
 * Auth state is managed by AuthProvider; this hook handles connection flow only.
 */

export function useWallet() {
  const {
    status,
    session,
    error,
    setStatus,
    setError,
    signOut,
    startConnection,
    completeConnection,
    failConnection,
  } = useWalletStore();

  const {
    handleError,
    executeWithErrorHandling,
    showSuccessNotification,
    showErrorNotification,
    hasError,
    canRetry
  } = useWalletErrorHandler();

  // ─── Session expiration watcher ─────────────────────────────────────────
  useEffect(() => {
    if (!session || !session.expiresAt) return;
    
    const now = Date.now();
    if (session.expiresAt <= now) {
      signOut();
      const appError = errorHandler.createError(
        'AUTHENTICATION',
        'SESSION_EXPIRED',
        new Error('Session expired')
      );
      showErrorNotification?.(appError);
      return;
    }

    // Set timer to auto sign out at expiration
    const msUntilExpiry = session.expiresAt - now;
    const timeout = setTimeout(() => {
      signOut();
      const appError = errorHandler.createError(
        'AUTHENTICATION',
        'SESSION_EXPIRED',
        new Error('Your session has expired. Please sign in again.')
      );
      showErrorNotification?.(appError);
    }, msUntilExpiry);

    return () => clearTimeout(timeout);
  }, [session?.expiresAt, signOut, showErrorNotification]);

  // ─── Connect wallet and create session ──────────────────────────────────
  const performConnect = useCallback(async (): Promise<AuthSession | null> => {
    return executeWithErrorHandling(async () => {
      startConnection();

      // Request wallet access
      const address = await connectFreighter();

      // Create auth message and sign it
      const { message } = createAuthMessage(address);
      setStatus('signing');
      const signed = await signFreighterMessage(address, message);

      // Create new session
      const newSession: AuthSession = {
        address,
        signedMessage: signed.signedMessage,
        signerAddress: signed.signerAddress,
        authenticatedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      completeConnection(newSession);

      if (showSuccessNotification) {
        showSuccessNotification('Wallet connected successfully');
      }

      return newSession;
    }, 'WALLET');
  }, [
    executeWithErrorHandling,
    startConnection,
    setStatus,
    completeConnection,
    showSuccessNotification
  ]);

  const connectWallet = useCallback(async (): Promise<AuthSession | null> => {
    // Return existing session if already connected
    if (session) {
      return session;
    }

    return performConnect();
  }, [session, performConnect]);

  // Force a fresh connection attempt even if a (possibly stale) session
  // already exists — used to retry after a failed connection.
  const reconnectWallet = useCallback(async (): Promise<AuthSession | null> => {
    return performConnect();
  }, [performConnect]);

  // ─── Disconnect wallet ───────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    blockchainEvents.stop();
    signOut();
    
    if (showSuccessNotification) {
      showSuccessNotification('Wallet disconnected');
    }
  }, [signOut, showSuccessNotification]);

  return {
    // Connection state
    status,
    session,
    error,
    hasError,
    canRetry,

    // Actions
    connectWallet,
    reconnectWallet,
    disconnect,
    handleError,
    showErrorNotification,

    // Convenience
    address: session?.address ?? null,
    isConnected: status === 'connected' && !!session,
    isConnecting: status === 'connecting' || status === 'signing',
  };
}
