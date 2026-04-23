/**
 * useDataFetch Hook
 * 
 * A reusable hook for fetching data with built-in loading, error, and caching support.
 * Replaces components that directly used mockData with proper async handling.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface DataFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseDateFetchOptions {
  // Cache data for this duration (ms). Set to 0 to disable caching
  cacheDuration?: number;
  // Automatically fetch on mount
  autoFetch?: boolean;
  // Callback when data is loaded
  onSuccess?: (data: any) => void;
  // Callback on error
  onError?: (error: Error) => void;
}

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const dataCache = new Map<string, CacheEntry<any>>();

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
  options: UseDateFetchOptions = {}
): DataFetchState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<DataFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const cacheKeyRef = useRef<string>(`cache-${Math.random()}`);
  const {
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    autoFetch = true,
    onSuccess,
    onError,
  } = options;

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchFn();
      setState({ data: result, loading: false, error: null });
      if (cacheDuration > 0) {
        dataCache.set(cacheKeyRef.current, {
          data: result,
          timestamp: Date.now(),
        });
      }
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
      onError?.(error);
    }
  }, [fetchFn, cacheDuration, onSuccess, onError]);

  useEffect(() => {
    if (!autoFetch) return;

    // Check cache first
    if (cacheDuration > 0) {
      const cached = dataCache.get(cacheKeyRef.current);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setState({ data: cached.data, loading: false, error: null });
        return;
      }
    }

    refetch();
  }, [autoFetch, cacheDuration, refetch]);

  return { ...state, refetch };
}

/**
 * Hook for fetching a list of items with pagination support
 */
export function useDataFetchList<T>(
  fetchFn: () => Promise<T[]>,
  options: UseDateFetchOptions = {}
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
  options: UseDateFetchOptions = {}
) {
  const result = useDataFetch(fetchFn, options);
  
  return {
    ...result,
    item: result.data,
    notFound: !result.loading && !result.error && !result.data,
  };
}

/**
 * Hook for dependency-based fetching (re-fetch when dependencies change)
 * Useful for fetching by ID or other parameters
 */
export function useDataFetchDependency<T>(
  fetchFn: (deps: any[]) => Promise<T>,
  dependencies: any[] = [],
  options: UseDateFetchOptions = {}
): DataFetchState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<DataFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await fetchFn(dependencies);
      setState({ data: result, loading: false, error: null });
      options.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ data: null, loading: false, error });
      options.onError?.(error);
    }
  }, [fetchFn, dependencies, options]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

/**
 * Clear all cached data
 * Useful for logout or resetting app state
 */
export function clearDataCache() {
  dataCache.clear();
}

/**
 * Get cache entry count (for debugging)
 */
export function getCacheInfo() {
  return {
    size: dataCache.size,
    entries: Array.from(dataCache.keys()),
  };
}
