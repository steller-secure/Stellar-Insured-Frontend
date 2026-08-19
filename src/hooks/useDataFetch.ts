"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { rateLimiter } from "@/lib/rateLimiter";
import { errorHandler, ErrorCategory, ErrorSeverity } from "@/lib/errorHandler";
import { useErrorHandler } from "./useErrorHandler";
import { blockchainEvents, type BlockchainEventType } from "@/lib/blockchainEvents";

export interface DataFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryCount: number;
}

interface UseDataFetchOptions<T = unknown> {
  cacheDuration?: number;
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error & { category: ErrorCategory; severity: ErrorSeverity }) => void;
  retryPolicy?: ErrorCategory;
  eventTypes?: BlockchainEventType[];
}

export interface UseDataFetchReturn<T> extends DataFetchState<T> {
  refetch: () => Promise<void>;
  hasError: boolean;
  isRecoverable: boolean;
  canRetry: boolean;
}

export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchOptions<T> = {}
): UseDataFetchReturn<T> {
  const {
    autoFetch = true,
    onSuccess,
    onError,
    retryPolicy,
    eventTypes,
  } = options;

  const fetchRef = useRef(fetchFn);
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);
  fetchRef.current = fetchFn;
  successRef.current = onSuccess;
  errorRef.current = onError;

  const errorHandlerHook = useErrorHandler({
    autoLog: false,
    showNotifications: false,
    retryPolicy: retryPolicy
      ? {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 8000,
          exponentialFactor: 2,
          jitter: true,
        }
      : undefined,
  });
  const handlerRef = useRef(errorHandlerHook);
  handlerRef.current = errorHandlerHook;

  const [state, setState] = useState<DataFetchState<T>>({
    data: null,
    loading: true,
    error: null,
    category: "NETWORK",
    severity: "MEDIUM",
    retryCount: 0,
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await rateLimiter.execute(() => fetchRef.current());
      setState({
        data: result,
        loading: false,
        error: null,
        category: "NETWORK",
        severity: "LOW",
        retryCount: 0,
      });
      successRef.current?.(result as T);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const category: ErrorCategory =
        handlerRef.current.hasError && handlerRef.current.error
          ? handlerRef.current.error.category
          : "NETWORK";
      const severity: ErrorSeverity =
        handlerRef.current.hasError && handlerRef.current.error
          ? handlerRef.current.error.severity
          : "MEDIUM";

      setState(prev => ({
        data: null,
        loading: false,
        error,
        category,
        severity,
        retryCount: prev.retryCount + 1,
      }));

      const errorWithMeta = Object.assign(error, { category, severity });
      errorRef.current?.(errorWithMeta as Error & { category: ErrorCategory; severity: ErrorSeverity });
      handlerRef.current.showErrorNotification(handlerRef.current.error ?? errorHandler.createError(category, "GENERIC_ERROR"));
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
    void refetch();
  }, [refetch, autoFetch]);

  const eventKey = eventTypes?.join(",");
  useEffect(() => {
    if (!eventTypes?.length) return;
    return blockchainEvents.subscribe(() => { void refetch(); }, eventTypes);
    // The string key intentionally makes equivalent inline arrays stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, eventKey]);

  return {
    ...state,
    refetch,
    hasError: state.error !== null,
    isRecoverable: state.category !== 'VALIDATION' && state.category !== 'AUTHENTICATION',
    canRetry:
      state.error !== null && errorHandlerHook.canRetry,
  };
}

export function useDataFetchOne<T>(
  fetchFn: () => Promise<T | undefined>,
  options: UseDataFetchOptions<T | undefined> = {}
) {
  const result = useDataFetch<T | undefined>(fetchFn, options);

  return {
    ...result,
    item: result.data ?? null,
    notFound: !result.loading && !result.error && !result.data,
    refetch: result.refetch,
  };
}

export function useDataFetchList<T>(
  fetchFn: () => Promise<T[]>,
  options: UseDataFetchOptions<T[]> = {}
) {
  const result = useDataFetch<T[]>(fetchFn, options);

  return {
    ...result,
    items: result.data || [],
    isEmpty: result.data?.length === 0,
    refetch: result.refetch,
  };
}

export function useDataFetchDependency<T>(
  fetchFn: (deps: unknown[]) => Promise<T>,
  dependencies: unknown[] = [],
  options: UseDataFetchOptions<T> = {}
) {
  const wrappedFetch = useCallback(() => fetchFn(dependencies), [fetchFn, ...dependencies]);
  const result = useDataFetch(wrappedFetch, options);

  return {
    ...result,
    refetch: result.refetch,
    hasError: result.hasError,
    isRecoverable: result.isRecoverable,
    canRetry: result.canRetry,
  };
}
