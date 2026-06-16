import React, { useCallback } from 'react';
import { useWalletStore } from '@/store';
import { connectFreighter, signFreighterMessage, createAuthMessage } from '@/lib/freighter';
import { useWalletErrorHandler } from '@/hooks/useErrorHandler';
import { errorHandler } from '@/lib/errorHandler';

export function useWallet() {
  const {
    status,
    session,
    error,
    setStatus,
    setSession,
    setError,
    signOut,
    isAddressRegistered,
    registerAddress,
    getRegisteredUser,
    startConnection,
    completeConnection,
    failConnection,
  } = useWalletStore();


  const {
    executeWithErrorHandling,
    handleError,
    showSuccessNotification,
    showErrorNotification,
    retryLastOperation,
    hasError,
    canRetry
  } = useWalletErrorHandler();

    // Session expiration watcher
    React.useEffect(() => {
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
      const timeout = setTimeout(() => {
        signOut();
        const appError = errorHandler.createError(
          'AUTHENTICATION',
          'SESSION_EXPIRED',
          new Error('Session expired')
        );
        showErrorNotification?.(appError);
      }, session.expiresAt - now);
      return () => clearTimeout(timeout);
    }, [session, signOut, showErrorNotification]);

  const connectWallet = useCallback(async () => {
    if (session) return session;
    return executeWithErrorHandling(async () => {
      startConnection();
      const address = await connectFreighter();
      const { message } = createAuthMessage(address);
      setStatus('signing');
      const signed = await signFreighterMessage(address, message);
      const newSession: AuthSession = {
        address,
        signedMessage: signed.signedMessage,
        signerAddress: signed.signerAddress,
        authenticatedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
      };
      completeConnection(newSession);
      return newSession;
    }, 'WALLET');
  }, [session, executeWithErrorHandling, startConnection, setStatus, completeConnection]);

  const disconnect = useCallback(() => {
    signOut();
    rateLimiter.reset(); //  Clear queue on logout
  }, [signOut]);

  return { status, session, connectWallet, disconnect, address: session?.address };
}