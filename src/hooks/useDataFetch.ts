'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { rateLimiter } from '../lib/rateLimiter';
<<<<<<< HEAD
import { errorHandler, ErrorCategory, ErrorSeverity } from '@/lib/errorHandler';
=======
import { errorHandler, ErrorCategory, ErrorSeverity, AppError } from '@/lib/errorHandler';
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)
import { useErrorHandler } from './useErrorHandler';
import { blockchainEvents, type BlockchainEventType } from '@/lib/blockchainEvents';

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
  // Callback when data is loaded
  onSuccess?: (data: T) => void;
  // Callback on error
  onError?: (error: Error & { category: ErrorCategory; severity: ErrorSeverity }) => void;
  // Retry policy override
  retryPolicy?: ErrorCategory;
  /** Refetch when any matching normalized on-chain event is received. */
  eventTypes?: BlockchainEventType[];
}

export interface UseDataFetchReturn<T> extends DataFetchState<T> {
  refetch: () => Promise<void>;
  hasError: boolean;
  isRecoverable: boolean;
  canRetry: boolean;
}

/**
 * Generic data fetch hook with loading states
 * 
 * @example
 * const { data, loading, error, refetch } = useDataFetch(
 *   async () => DataService.getPolicies(),
 *   { cacheDuration: 5 * 60 * 1000 } // 5 minutes
 * );
 */
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
    category: 'NETWORK',
    severity: 'MEDIUM',
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
        category: 'NETWORK',
        severity: 'LOW',
        retryCount: 0,
      });
      successRef.current?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const category: ErrorCategory =
        handlerRef.current.hasError && handlerRef.current.error
          ? handlerRef.current.error.category
          : 'NETWORK';
      const severity: ErrorSeverity =
        handlerRef.current.hasError && handlerRef.current.error
          ? handlerRef.current.error.severity
          : 'MEDIUM';

      setState(prev => ({
        data: null,
        loading: false,
        error,
        category,
        severity,
        retryCount: prev.retryCount + 1,
      }));

<<<<<<< HEAD
      errorRef.current?.(error as Error & { category: ErrorCategory; severity: ErrorSeverity });
      handlerRef.current.showErrorNotification(handlerRef.current.error ?? errorHandler.createError(category, 'GENERIC_ERROR'));
=======
      const errorWithMeta = Object.assign(error, { category, severity });
      onError?.(errorWithMeta);
      errorHandlerHook.showErrorNotification(errorHandlerHook.error ?? errorHandler.createError(category, 'GENERIC_ERROR'));
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
<<<<<<< HEAD

    void refetch();
=======
    refetch();
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)
  }, [refetch, autoFetch]);

  const eventKey = eventTypes?.join(',');
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

/**
 * Hook for fetching a single item
 */
export function useDataFetchOne<T>(
  fetchFn: () => Promise<T | undefined>,
  options: UseDataFetchOptions<T | undefined> = {}
): {
  item: T | null;
  loading: boolean;
  error: Error | null;
  category: ErrorCategory;
  severity: ErrorSeverity;
  notFound: boolean;
  refetch: () => Promise<void>;
  hasError: boolean;
  isRecoverable: boolean;
  canRetry: boolean;
} {
  const result = useDataFetch<T | undefined>(fetchFn, options);

  return {
    ...result,
    item: result.data ?? null,
    notFound: !result.loading && !result.error && !result.data,
    refetch: result.refetch,
  };
}

/**
 * Hook for fetching a list of items
 */
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

/**
 * Hook for fetching data with dependencies
 */
export function useDataFetchDependency<T>(
  fetchFn: (deps: unknown[]) => Promise<T>,
  dependencies: unknown[] = [],
  options: UseDataFetchOptions<T> = {}
): DataFetchState<T> & { refetch: () => Promise<void>; hasError: boolean; isRecoverable: boolean; canRetry: boolean } {
<<<<<<< HEAD
  const dependencyKey = JSON.stringify(dependencies);
  const dependencyFetch = useCallback(() => fetchFn(dependencies), [fetchFn, dependencyKey]);
  const result = useDataFetch(dependencyFetch, { ...options, autoFetch: false });
  useEffect(() => {
    if (options.autoFetch === false) return;
    void result.refetch();
    // dependencyKey captures changes to dependency values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey, options.autoFetch, result.refetch]);
=======
  const wrappedFetch = useCallback(() => fetchFn(dependencies), [fetchFn, ...dependencies]);
  const result = useDataFetch(wrappedFetch, options);
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)

  return {
    ...result,
    refetch: result.refetch,
    hasError: result.hasError,
    isRecoverable: result.isRecoverable,
    canRetry: result.canRetry,
  };
}
