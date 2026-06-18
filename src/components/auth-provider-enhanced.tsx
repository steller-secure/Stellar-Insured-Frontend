"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useWallet } from "@/hooks/useWallet";
import { AuthSession, RegisteredUser } from "@/store/types";
import { secureStorage } from "@/lib/security";
import { isConnected } from "@stellar/freighter-api";
import { useWalletStore } from "@/store";

// Maintain backward compatibility with existing AuthContext interface
type AuthContextValue = {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  signOut: () => void;
  isAddressRegistered: (address: string) => boolean;
  registerAddress: (address: string, user?: RegisteredUser) => void;
  getRegisteredUser: (address: string) => RegisteredUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Enhanced AuthProvider that uses centralized state management
 * Maintains backward compatibility with existing useAuth() hook
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();
  const { setSession, signOut } = useWalletStore(); // Get from store directly
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Initialize session from secure storage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = secureStorage.getItem("wallet_session");
        if (stored) {
          const session = JSON.parse(stored) as AuthSession;
          
          // Check expiry
          if (session.expiresAt && session.expiresAt > Date.now()) {
            // Validate with Freighter
            const connected = await isConnected();
            if (connected.isConnected) {
              setSession(session);
            } else {
              // Not connected to freighter, clear session
              secureStorage.removeItem("wallet_session");
              signOut();
            }
          } else {
            // Expired
            secureStorage.removeItem("wallet_session");
            signOut();
          }
        }
      } catch (e) {
        console.error("Failed to restore session:", e);
        secureStorage.removeItem("wallet_session");
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, [setSession, signOut]);

  // Sync with cookies and secure storage
  useEffect(() => {
    if (isInitializing) return; // Don't persist during initialization
    
    if (wallet.session) {
      // Set session cookie for middleware
      document.cookie = `stellar_insured_session=${JSON.stringify(wallet.session)}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
      // Persist to local storage securely
      secureStorage.setItem("wallet_session", JSON.stringify(wallet.session));
    } else {
      // Clear session cookie and storage
      document.cookie = 'stellar_insured_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      secureStorage.removeItem("wallet_session");
    }
  }, [wallet.session, isInitializing]);

  // Create backward-compatible context value
  const contextValue = useMemo<AuthContextValue>(() => ({
    session: wallet.session,
    setSession: (session) => {
      if (session) {
        setSession(session);
      } else {
        wallet.disconnect();
      }
    },
    signOut: wallet.disconnect,
    isAddressRegistered: useWalletStore.getState().isAddressRegistered,
    registerAddress: useWalletStore.getState().registerAddress,
    getRegisteredUser: useWalletStore.getState().getRegisteredUser,
  }), [
    wallet.session,
    setSession,
    wallet.disconnect,
  ]);

  if (isInitializing) {
    return null; // Or a proper loading spinner if preferred, but usually null avoids hydration mismatch
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Backward-compatible useAuth hook
 * Components can continue using this without changes
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Enhanced useAuthState hook that provides additional state information
 * Use this for new components that need more detailed state
 */
export function useAuthState() {
  const wallet = useWallet();
  const auth = useAuth();
  
  return {
    // Backward compatibility
    ...auth,
    
    // Enhanced state
    status: wallet.status,
    error: wallet.error,
    isConnected: wallet.isConnected,
    isConnecting: wallet.isConnecting,
    address: wallet.address,
    authenticatedAt: wallet.authenticatedAt,
    
    // Enhanced actions
    connectWallet: wallet.connectWallet,
  };
}