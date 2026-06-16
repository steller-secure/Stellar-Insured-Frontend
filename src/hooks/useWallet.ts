import React, { useCallback } from 'react';
import { useWalletStore } from '@/store';
import { connectFreighter, signFreighterMessage, createAuthMessage } from '@/lib/freighter';
import { useWalletErrorHandler } from '@/hooks/useErrorHandler';
import { rateLimiter } from '../lib/rateLimiter';
import type { AuthSession } from '@/store/types';

export function useWallet() {
  const { status, session, signOut, setStatus, completeConnection, startConnection, isAddressRegistered, registerAddress } = useWalletStore();
  const { executeWithErrorHandling, showSuccessNotification, showErrorNotification, showInfoNotification } = useWalletErrorHandler();

  // Reset on expiration
  React.useEffect(() => {
    if (!session?.expiresAt) return;
    const timeout = setTimeout(() => {
      signOut();
      rateLimiter.reset(); //  Clear queue
      showInfoNotification?.('Session expired.');
    }, session.expiresAt - Date.now());
    return () => clearTimeout(timeout);
  }, [session, signOut, showInfoNotification]);

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