"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useWalletStore } from "@/store";
import { AuthSession, RegisteredUser } from "@/store/types";
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
