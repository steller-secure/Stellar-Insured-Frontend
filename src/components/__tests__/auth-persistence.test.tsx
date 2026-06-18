import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { AuthProvider } from '../auth-provider-enhanced';
import { secureStorage } from '@/lib/security';
import { isConnected } from '@stellar/freighter-api';
import { useWalletStore } from '@/store';

// Mock dependencies
jest.mock('@/lib/security', () => ({
  secureStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('@stellar/freighter-api', () => ({
  isConnected: jest.fn(),
}));

// Mock the wallet store
jest.mock('@/store', () => {
  const setSessionMock = jest.fn();
  const signOutMock = jest.fn();
  return {
    useWalletStore: Object.assign(
      jest.fn(() => ({
        setSession: setSessionMock,
        signOut: signOutMock,
      })),
      {
        getState: jest.fn(() => ({
          isAddressRegistered: jest.fn(),
          registerAddress: jest.fn(),
          getRegisteredUser: jest.fn(),
        })),
      }
    ),
  };
});

// Mock useWallet
jest.mock('@/hooks/useWallet', () => ({
  useWallet: jest.fn(() => ({
    session: null,
    disconnect: jest.fn(),
  })),
}));

describe('AuthProvider Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document cookie
    document.cookie = '';
  });

  it('restores valid unexpired session if Freighter is connected', async () => {
    const validSession = {
      address: 'GABC...',
      expiresAt: Date.now() + 100000,
    };
    
    (secureStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(validSession));
    (isConnected as jest.Mock).mockResolvedValue({ isConnected: true });

    render(<AuthProvider><div>App</div></AuthProvider>);

    await waitFor(() => {
      expect(secureStorage.getItem).toHaveBeenCalledWith('wallet_session');
      expect(isConnected).toHaveBeenCalled();
      const { setSession } = useWalletStore();
      expect(setSession).toHaveBeenCalledWith(validSession);
    });
  });

  it('clears session and signs out if Freighter is not connected', async () => {
    const validSession = {
      address: 'GABC...',
      expiresAt: Date.now() + 100000,
    };
    
    (secureStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(validSession));
    (isConnected as jest.Mock).mockResolvedValue({ isConnected: false });

    render(<AuthProvider><div>App</div></AuthProvider>);

    await waitFor(() => {
      expect(isConnected).toHaveBeenCalled();
      expect(secureStorage.removeItem).toHaveBeenCalledWith('wallet_session');
      const { signOut } = useWalletStore();
      expect(signOut).toHaveBeenCalled();
    });
  });

  it('clears session and signs out if session is expired', async () => {
    const expiredSession = {
      address: 'GABC...',
      expiresAt: Date.now() - 100000, // Expired
    };
    
    (secureStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(expiredSession));

    render(<AuthProvider><div>App</div></AuthProvider>);

    await waitFor(() => {
      expect(isConnected).not.toHaveBeenCalled();
      expect(secureStorage.removeItem).toHaveBeenCalledWith('wallet_session');
      const { signOut } = useWalletStore();
      expect(signOut).toHaveBeenCalled();
    });
  });
});
