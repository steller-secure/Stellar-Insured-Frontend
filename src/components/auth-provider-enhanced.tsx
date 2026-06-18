"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useWalletStore } from "@/store";
import { AuthSession, RegisteredUser } from "@/store/types";
import { secureStorage } from "@/lib/security";
import { isConnected } from "@stellar/freighter-api";
import { useWalletStore } from "@/store";
import { validateSessionWallet, isValidStellarAddress } from "@/lib/walletValidation";

type AuthContextValue = {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  signOut: () => void;
  isAddressRegistered: (address: string) => boolean;
  registerAddress: (address: string, user?: RegisteredUser) => void;
  getRegisteredUser: (address: string) => RegisteredUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Interval (ms) between periodic wallet-match checks while a session is active */
const WALLET_VALIDATION_INTERVAL_MS = 30_000;

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
  const {
    session,
    setSession: storeSetSession,
    signOut: storeSignOut,
    isAddressRegistered,
    registerAddress,
    getRegisteredUser,
  } = useWalletStore();

  // ── Cookie sync for middleware ──────────────────────────────────────────────
  useEffect(() => {
    if (session) {
      // Validate address format before writing cookie
      if (!isValidStellarAddress(session.address)) {
        storeSignOut();
        return;
      }
      document.cookie = `stellar_insured_session=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
    } else {
      document.cookie = "stellar_insured_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }, [session, storeSignOut]);

  // ── Periodic wallet mismatch detection ─────────────────────────────────────
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    if (!session) return;

    const check = async () => {
      const current = sessionRef.current;
      if (!current) return;

      const result = await validateSessionWallet(current);
      if (!result.valid) {
        console.warn("Wallet validation failed, signing out:", result.error);
        storeSignOut();
      }
    };

    const id = setInterval(check, WALLET_VALIDATION_INTERVAL_MS);
    return () => clearInterval(id);
  }, [session?.address, storeSignOut]); // restart when address changes

  // ── Context value ───────────────────────────────────────────────────────────
  const setSession = useCallback(
    (next: AuthSession | null) => {
      if (next) {
        storeSetSession(next);
      } else {
        storeSignOut();
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
    [storeSetSession, storeSignOut]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      setSession,
      signOut: storeSignOut,
      isAddressRegistered,
      registerAddress,
      getRegisteredUser,
    }),
    [session, setSession, storeSignOut, isAddressRegistered, registerAddress, getRegisteredUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
