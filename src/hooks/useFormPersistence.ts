'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface FormPersistenceConfig {
  /** Unique key for storage. Used as the sessionStorage key. */
  storageKey: string;
  /** Time-to-live in milliseconds. Defaults to 24 hours. */
  ttl?: number;
  /** Debounce delay in ms before writing to storage. Defaults to 500ms. */
  debounceMs?: number;
  /** Use localStorage instead of sessionStorage. Defaults to false. */
  useLocalStorage?: boolean;
}

interface PersistedState<T> {
  data: T;
  currentStep: number;
  savedAt: number;
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_DEBOUNCE = 500;

function getStorage(useLocal: boolean): Storage | null {
  if (typeof window === 'undefined') return null;
  return useLocal ? window.localStorage : window.sessionStorage;
}

export interface UseFormPersistenceReturn<T> {
  /** Load persisted data. Returns null if expired or missing. */
  load: () => { data: T; currentStep: number } | null;
  /** Save form data and current step (debounced). */
  save: (data: T, currentStep: number) => void;
  /** Immediately flush pending saves to storage. */
  flush: () => void;
  /** Clear persisted data from storage. */
  clear: () => void;
  /** Whether a valid draft was found on initial load. */
  hasDraft: boolean;
  /** Timestamp of the last save, or null if none. */
  lastSavedAt: number | null;
}

export function useFormPersistence<T>(
  config: FormPersistenceConfig
): UseFormPersistenceReturn<T> {
  const {
    storageKey,
    ttl = DEFAULT_TTL,
    debounceMs = DEFAULT_DEBOUNCE,
    useLocalStorage = false,
  } = config;

  const [hasDraft, setHasDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingState = useRef<PersistedState<T> | null>(null);

  const storage = getStorage(useLocalStorage);

  const load = useCallback((): { data: T; currentStep: number } | null => {
    if (!storage) return null;

    const raw = storage.getItem(storageKey);
    if (!raw) return null;

    try {
      const parsed: PersistedState<T> = JSON.parse(raw);

      // Check TTL expiry
      if (Date.now() - parsed.savedAt > ttl) {
        storage.removeItem(storageKey);
        return null;
      }

      return { data: parsed.data, currentStep: parsed.currentStep };
    } catch {
      storage.removeItem(storageKey);
      return null;
    }
  }, [storage, storageKey, ttl]);

  const writeToStorage = useCallback(
    (state: PersistedState<T>) => {
      if (!storage) return;
      storage.setItem(storageKey, JSON.stringify(state));
      setLastSavedAt(state.savedAt);
    },
    [storage, storageKey]
  );

  const save = useCallback(
    (data: T, currentStep: number) => {
      const state: PersistedState<T> = {
        data,
        currentStep,
        savedAt: Date.now(),
      };
      pendingState.current = state;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        writeToStorage(state);
        debounceTimer.current = null;
      }, debounceMs);
    },
    [writeToStorage, debounceMs]
  );

  const flush = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (pendingState.current) {
      writeToStorage(pendingState.current);
      pendingState.current = null;
    }
  }, [writeToStorage]);

  const clear = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    pendingState.current = null;
    if (storage) {
      storage.removeItem(storageKey);
    }
    setHasDraft(false);
    setLastSavedAt(null);
  }, [storage, storageKey]);

  // Check for existing draft on mount
  useEffect(() => {
    const draft = load();
    setHasDraft(draft !== null);
  }, [load]);

  // Flush pending writes on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (pendingState.current && storage) {
        storage.setItem(storageKey, JSON.stringify(pendingState.current));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { load, save, flush, clear, hasDraft, lastSavedAt };
}
