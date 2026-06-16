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
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchOptions = {}
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
    if (autoFetch) {
      refetch();
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
  options: UseDataFetchOptions = {}
): { items: T[]; loading: boolean; error: Error | null; refetch: () => Promise<void> } {
  const { autoFetch = true, onSuccess, onError } = options;
  const [state, setState] = useState<{ items: T[]; loading: boolean; error: Error | null }>({
    items: [],
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await rateLimiter.execute(() => fetchFn());
      setState({ items: result, loading: false, error: null });
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setState({ items: [], loading: false, error });
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

export function useDataFetchDependency<T>(
  fetchFn: (deps: any[]) => Promise<T>,
  dependencies: any[] = [],
  options: UseDataFetchOptions = {}
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