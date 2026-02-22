import { useCallback } from 'react';
import { useWalletStore } from '@/store';
import { connectFreighter, signFreighterMessage, createAuthMessage } from '@/lib/freighter';
import { useWalletErrorHandler } from '@/hooks/useErrorHandler';

/**
 * Enhanced wallet hook that integrates with centralized state management
 * Provides wallet connection, authentication, and user management
 * Integrates with error handling system for better user experience
 */
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

  const connectWallet = useCallback(async () => {
    if (session) return session; // Already connected
    
    return executeWithErrorHandling(
      async () => {
        startConnection();
        
        // Connect to Freighter wallet
        const address = await connectFreighter();
        
        // Auto-register address if not registered (for demo purposes)
        if (!isAddressRegistered(address)) {
          registerAddress(address, {
            createdAt: Date.now(),
            email: undefined
          });
        }
        
        // Create and sign authentication message
        const { message } = createAuthMessage(address);
        setStatus('signing');
        
        const signed = await signFreighterMessage(address, message);
        
        const newSession = {
          address,
          signedMessage: signed.signedMessage,
          signerAddress: signed.signerAddress,
          authenticatedAt: Date.now(),
        };
        
        completeConnection(newSession);
        showSuccessNotification('Wallet connected successfully!');
        return newSession;
      },
      'WALLET',
      'GENERIC_ERROR',
      { action: 'connectWallet' }
    );
  }, [
    session,
    executeWithErrorHandling,
    startConnection,
    isAddressRegistered,
    registerAddress,
    setStatus,
    completeConnection,
    showSuccessNotification
  ]);

  const disconnect = useCallback(() => {
    signOut();
  }, [signOut]);

  const reconnectWallet = useCallback(async () => {
    if (hasError && canRetry) {
      return retryLastOperation(
        async () => {
          startConnection();
          const address = await connectFreighter();
          
          const { message } = createAuthMessage(address);
          setStatus('signing');
          
          const signed = await signFreighterMessage(address, message);
          
          const newSession = {
            address,
            signedMessage: signed.signedMessage,
            signerAddress: signed.signerAddress,
            authenticatedAt: Date.now(),
          };
          
          completeConnection(newSession);
          showSuccessNotification('Wallet reconnected successfully!');
          return newSession;
        },
        'WALLET',
        'GENERIC_ERROR',
        { action: 'reconnectWallet' }
      );
    }
    return null;
  }, [
    hasError,
    canRetry,
    retryLastOperation,
    startConnection,
    setStatus,
    completeConnection,
    showSuccessNotification
  ]);

  const isConnected = status === 'connected' && !!session;
  const isConnecting = status === 'connecting' || status === 'signing';

  return {
    // State
    status,
    session,
    error,
    isConnected,
    isConnecting,
    hasError,
    canRetry,
    
    // Actions
    connectWallet,
    disconnect,
    reconnectWallet,
    setSession,
    
    // Error handling
    handleError,
    showErrorNotification,
    
    // User management
    isAddressRegistered,
    registerAddress,
    getRegisteredUser,
    
    // Computed values
    address: session?.address,
    authenticatedAt: session?.authenticatedAt,
  };
}