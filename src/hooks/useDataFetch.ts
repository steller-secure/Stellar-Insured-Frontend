'use client';

import { useState, useEffect, useCallback } from 'react';
import { rateLimiter } from '../lib/rateLimiter';

export interface DataFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseDataFetchOptions {
  cacheDuration?: number;
  autoFetch?: boolean;
  // Callback when data is loaded
  onSuccess?: (data: T) => void;
  // Callback on error
  onError?: (error: Error) => void;
}

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const dataCache = new Map<string, CacheEntry<unknown>>();

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
  options: UseDateFetchOptions<T> = {}
): DataFetchState<T> & { refetch: () => Promise<void> } {
  const { autoFetch = true, onSuccess, onError } = options;
  const [state, setState] = useState<DataFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await rateLimiter.execute(() => fetchFn());
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
      onError?.(error);
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (!autoFetch) return;

    // Check cache first
    if (cacheDuration > 0) {
      const cached = dataCache.get(cacheKeyRef.current);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setState({ data: cached.data as T, loading: false, error: null });
        return;
      }
    }
  }, [refetch, autoFetch]);

  return { ...state, refetch };
}

export function useDataFetchOne<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchOptions = {}
): { item: T | null; loading: boolean; error: Error | null; refetch: () => Promise<void> } {
  const { autoFetch = true, onSuccess, onError } = options;
  const [state, setState] = useState<{ item: T | null; loading: boolean; error: Error | null }>({
    item: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await rateLimiter.execute(() => fetchFn());
      setState({ item: result, loading: false, error: null });
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ item: null, loading: false, error });
      onError?.(error);
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [refetch, autoFetch]);

  return { ...state, refetch };
}

export function useDataFetchList<T>(
  fetchFn: () => Promise<T[]>,
  options: UseDateFetchOptions<T[]> = {}
) {
  const result = useDataFetch(fetchFn, options);
  
  return {
    ...result,
    items: result.data || [],
    isEmpty: result.data?.length === 0,
  };
}

/**
 * Hook for fetching a single item
 */
export function useDataFetchOne<T>(
  fetchFn: () => Promise<T | undefined>,
  options: UseDateFetchOptions<T | undefined> = {}
) {
  const result = useDataFetch(fetchFn, options);
  
  return {
    ...result,
    item: result.data,
    notFound: !result.loading && !result.error && !result.data,
  };
}

export function useDataFetchDependency<T>(
  fetchFn: (deps: unknown[]) => Promise<T>,
  dependencies: unknown[] = [],
  options: UseDateFetchOptions<T> = {}
): DataFetchState<T> & { refetch: () => Promise<void> } {
  const { autoFetch = true, onSuccess, onError } = options;
  const [state, setState] = useState<DataFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await rateLimiter.execute(() => fetchFn(dependencies));
      setState({ data: result, loading: false, error: null });
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
      onError?.(error);
    }
  }, [fetchFn, dependencies, onSuccess, onError]);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [refetch, autoFetch]);

  return { ...state, refetch };
}