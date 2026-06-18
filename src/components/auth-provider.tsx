"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { validateSessionWallet, validateWalletFunded, validateSessionFields } from "@/lib/walletValidation";

export type AuthSession = {
  address: string;
  signedMessage: string;
  signerAddress: string;
  authenticatedAt: number;
  expiresAt: number;
  refreshToken?: string;
};

export type RegisteredUser = {
  createdAt: number;
  email?: string;
};

export type WalletWarning = "mismatch" | "unfunded" | null;

type AuthContextValue = {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
  signOut: () => void;
  isAddressRegistered: (address: string) => boolean;
  registerAddress: (address: string, user?: RegisteredUser) => void;
  getRegisteredUser: (address: string) => RegisteredUser | null;
  walletWarning: WalletWarning;
};

const VALIDATION_INTERVAL_MS = 60_000; // validate every 60 seconds

const SESSION_KEY = "stellar_insured_session";
const USERS_KEY = "stellar_insured_users";

const AuthContext = createContext<AuthContextValue | null>(null);

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeUsers(value: unknown): Record<string, RegisteredUser> {
  if (!value) return {};
  if (Array.isArray(value)) {
    return value.reduce<Record<string, RegisteredUser>>((acc, address) => {
      if (typeof address === "string") acc[address] = { createdAt: Date.now() };
      return acc;
    }, {});
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.entries(obj).reduce<Record<string, RegisteredUser>>((acc, [k, v]) => {
      if (typeof k !== "string") return acc;
      if (typeof v === "object" && v) {
        const vv = v as Partial<RegisteredUser>;
        acc[k] = {
          createdAt: typeof vv.createdAt === "number" ? vv.createdAt : Date.now(),
          email: typeof vv.email === "string" ? vv.email : undefined,
        };
      } else {
        acc[k] = { createdAt: Date.now() };
      }
      return acc;
    }, {});
  }

  return {};
}

function readRegisteredUsers(): Record<string, RegisteredUser> {
  if (typeof window === "undefined") return {};
  const parsed = safeParseJson<unknown>(window.localStorage.getItem(USERS_KEY));
  return normalizeUsers(parsed);
}

function writeRegisteredUsers(users: Record<string, RegisteredUser>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [walletWarning, setWalletWarning] = useState<WalletWarning>(null);
  const sessionRef = useRef<AuthSession | null>(null);

  useEffect(() => {
    const parsed = safeParseJson<AuthSession>(
      typeof window === "undefined" ? null : window.localStorage.getItem(SESSION_KEY),
    );
    if (parsed && validateSessionFields(parsed)) {
      setSessionState(parsed);
      sessionRef.current = parsed;
    }
  }, []);

  /** Periodically validate wallet: check session fields, mismatch, and funded status */
  useEffect(() => {
    async function runValidation() {
      const s = sessionRef.current;
      if (!s) return;

      // Session expired or invalid fields → sign out
      if (!validateSessionFields(s)) {
        setSessionState(null);
        sessionRef.current = null;
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(SESSION_KEY);
          document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
        return;
      }

      // Check wallet mismatch
      const walletResult = await validateSessionWallet(s);
      if (!walletResult.valid) {
        setWalletWarning("mismatch");
        return;
      }

      // Check funded status
      const fundedResult = await validateWalletFunded(s.address);
      setWalletWarning(fundedResult.funded ? null : "unfunded");
    }

    const id = setInterval(runValidation, VALIDATION_INTERVAL_MS);
    // Run once on mount if session exists
    runValidation();
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setSession = useCallback((next: AuthSession | null) => {
    setSessionState(next);
    sessionRef.current = next;
    if (next) setWalletWarning(null);
    if (typeof window === "undefined") return;
    if (next) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      // Sync to cookie for middleware access (expires in 24 hours)
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${SESSION_KEY}=${encodeURIComponent(JSON.stringify(next))}; path=/; expires=${expires}; SameSite=Lax`;
    } else {
      window.localStorage.removeItem(SESSION_KEY);
      document.cookie = `${SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const isAddressRegistered = useCallback((address: string) => {
    const users = readRegisteredUsers();
    return Boolean(users[address]);
  }, []);

  const getRegisteredUser = useCallback((address: string) => {
    const users = readRegisteredUsers();
    return users[address] ?? null;
  }, []);

  const registerAddress = useCallback((address: string, user?: RegisteredUser) => {
    const users = readRegisteredUsers();
    if (users[address]) return;
    writeRegisteredUsers({
      ...users,
      [address]: user ?? { createdAt: Date.now() },
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      setSession,
      signOut,
      isAddressRegistered,
      registerAddress,
      getRegisteredUser,
      walletWarning,
    }),
    [session, setSession, signOut, isAddressRegistered, registerAddress, getRegisteredUser, walletWarning],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
