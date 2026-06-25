import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useDataFetch,
  useDataFetchList,
  useDataFetchOne,
  useDataFetchDependency,
} from '../useDataFetch';
import { rateLimiter } from '@/lib/rateLimiter';
import fc from 'fast-check';

// Mock rateLimiter so tests don't wait on real rate-limiting
jest.mock('@/lib/rateLimiter', () => ({
  rateLimiter: {
    execute: jest.fn((fn) => fn()),
    reset: jest.fn(),
  },
}));

describe('useDataFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ──────────────────────────────────────────────────────────
  // Basic Functionality
  // ──────────────────────────────────────────────────────────
  describe('Basic Functionality', () => {
    it('starts in loading state then resolves with data', async () => {
      const mockData = { id: 1, name: 'Test' };
      const fetchFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useDataFetch(fetchFn));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
      expect(rateLimiter.execute).toHaveBeenCalled();
    });

    it('sets error state when fetch throws', async () => {
      const mockError = new Error('Fetch failed');
      const fetchFn = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useDataFetch(fetchFn));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toBe(null);
      expect(result.current.error).toEqual(mockError);
    });

    it('coerces non-Error rejections into Error instances', async () => {
      const fetchFn = jest.fn().mockRejectedValue('String error');

      const { result } = renderHook(() => useDataFetch(fetchFn));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('String error');
    });

    it('does not fetch when autoFetch is false', () => {
      const fetchFn = jest.fn();

      const { result } = renderHook(() =>
        useDataFetch(fetchFn, { autoFetch: false })
      );

      jest.advanceTimersByTime(200);

      expect(fetchFn).not.toHaveBeenCalled();
      // loading is still true because no fetch was triggered
      expect(result.current.loading).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // Refetch
  // ──────────────────────────────────────────────────────────
  describe('refetch()', () => {
    it('re-runs fetchFn and updates data', async () => {
      const mockData1 = { id: 1 };
      const mockData2 = { id: 2 };
      const fetchFn = jest
        .fn()
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);

      const { result } = renderHook(() => useDataFetch(fetchFn));

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.data).toEqual(mockData1);

      await act(async () => { await result.current.refetch(); });

      expect(result.current.data).toEqual(mockData2);
      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('sets loading to true while refetching', async () => {
      let resolveFirst: (v: unknown) => void;
      const fetchFn = jest
        .fn()
        .mockResolvedValueOnce({ id: 1 })
        .mockImplementationOnce(
          () => new Promise((res) => { resolveFirst = res; })
        );

      const { result } = renderHook(() => useDataFetch(fetchFn));
      await waitFor(() => expect(result.current.loading).toBe(false));

      act(() => { result.current.refetch(); });

      expect(result.current.loading).toBe(true);

      await act(async () => { resolveFirst!({ id: 2 }); });
      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('clears error on successful refetch', async () => {
      const fetchFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce({ id: 1 });

      const { result } = renderHook(() => useDataFetch(fetchFn));

      await waitFor(() => expect(result.current.error).not.toBeNull());

      await act(async () => { await result.current.refetch(); });

      expect(result.current.error).toBe(null);
      expect(result.current.data).toEqual({ id: 1 });
    });
  });

  // ──────────────────────────────────────────────────────────
  // Callbacks
  // ──────────────────────────────────────────────────────────
  describe('Callbacks', () => {
    it('calls onSuccess with fetched data', async () => {
      const mockData = { id: 1 };
      const onSuccess = jest.fn();
      const fetchFn = jest.fn().mockResolvedValue(mockData);

      renderHook(() => useDataFetch(fetchFn, { onSuccess }));

      await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(mockData));
    });

    it('calls onError with the error', async () => {
      const mockError = new Error('Fetch failed');
      const onError = jest.fn();
      const fetchFn = jest.fn().mockRejectedValue(mockError);

      renderHook(() => useDataFetch(fetchFn, { onError }));

      await waitFor(() => expect(onError).toHaveBeenCalledWith(mockError));
    });
  });

  // ──────────────────────────────────────────────────────────
  // useDataFetchList
  // ──────────────────────────────────────────────────────────
  describe('useDataFetchList', () => {
    it('exposes items and isEmpty helpers', async () => {
      const mockList = [{ id: 1 }, { id: 2 }];
      const fetchFn = jest.fn().mockResolvedValue(mockList);

      const { result } = renderHook(() => useDataFetchList(fetchFn));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.items).toEqual(mockList);
      expect(result.current.isEmpty).toBe(false);
    });

    it('isEmpty is true for empty arrays', async () => {
      const fetchFn = jest.fn().mockResolvedValue([]);

      const { result } = renderHook(() => useDataFetchList(fetchFn));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.isEmpty).toBe(true);
    });

    it('falls back to empty array when data is null (error case)', async () => {
      const fetchFn = jest.fn().mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useDataFetchList(fetchFn));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.items).toEqual([]);
    });
  });

  // ──────────────────────────────────────────────────────────
  // useDataFetchOne
  // ──────────────────────────────────────────────────────────
  describe('useDataFetchOne', () => {
    it('exposes item from the fetched result', async () => {
      const mockItem = { id: 1, name: 'Test' };
      const fetchFn = jest.fn().mockResolvedValue(mockItem);

      const { result } = renderHook(() => useDataFetchOne(fetchFn));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.item).toEqual(mockItem);
      expect(result.current.notFound).toBe(false);
    });

    it('sets notFound when result is undefined', async () => {
      const fetchFn = jest.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useDataFetchOne(fetchFn));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.notFound).toBe(true);
    });

    it('does not set notFound while loading', () => {
      const fetchFn = jest.fn().mockImplementation(
        () => new Promise((res) => setTimeout(() => res({ id: 1 }), 500))
      );

      const { result } = renderHook(() => useDataFetchOne(fetchFn));

      expect(result.current.loading).toBe(true);
      expect(result.current.notFound).toBe(false);
    });

    it('does not set notFound when there is an error', async () => {
      const fetchFn = jest.fn().mockRejectedValue(new Error('fail'));

      const { result } = renderHook(() => useDataFetchOne(fetchFn));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.notFound).toBe(false);
      expect(result.current.error).not.toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────────
  // useDataFetchDependency
  // ──────────────────────────────────────────────────────────
  describe('useDataFetchDependency', () => {
    it('passes dependencies to fetchFn', async () => {
      const mockData = { result: 'ok' };
      const fetchFn = jest.fn().mockResolvedValue(mockData);
      const deps = [1, 'test', true];

      const { result } = renderHook(() =>
        useDataFetchDependency(fetchFn, deps)
      );

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(fetchFn).toHaveBeenCalledWith(deps);
      expect(result.current.data).toEqual(mockData);
    });

    it('refetches when dependencies array changes', async () => {
      const fetchFn = jest
        .fn()
        .mockResolvedValueOnce({ id: 1 })
        .mockResolvedValueOnce({ id: 2 });

      const { result, rerender } = renderHook(
        ({ deps }) => useDataFetchDependency(fetchFn, deps),
        { initialProps: { deps: [1] } }
      );

      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.data).toEqual({ id: 1 });

      rerender({ deps: [2] });

      await waitFor(() => expect(result.current.data).toEqual({ id: 2 }));
      expect(fetchFn).toHaveBeenNthCalledWith(1, [1]);
      expect(fetchFn).toHaveBeenNthCalledWith(2, [2]);
    });
  });

  // ──────────────────────────────────────────────────────────
  // Property-Based Tests
  // ──────────────────────────────────────────────────────────
  describe('Property-Based Tests', () => {
    it('data and error are mutually exclusive after fetch', async () => {
      await fc.assert(
        fc.asyncProperty(fc.object(), async (mockData) => {
          const fetchFn = jest.fn().mockResolvedValue(mockData);
          const { result } = renderHook(() => useDataFetch(fetchFn));

          await waitFor(() => expect(result.current.loading).toBe(false));

          const { data, error } = result.current;
          // On success: data set, error null
          expect(data).toEqual(mockData);
          expect(error).toBeNull();
        }),
        { numRuns: 20 }
      );
    });

    it('useDataFetchList.items length matches source array', async () => {
      await fc.assert(
        fc.asyncProperty(fc.array(fc.integer()), async (arr) => {
          const fetchFn = jest.fn().mockResolvedValue(arr);
          const { result } = renderHook(() => useDataFetchList(fetchFn));

          await waitFor(() => expect(result.current.loading).toBe(false));

          expect(result.current.items).toHaveLength(arr.length);
          expect(result.current.isEmpty).toBe(arr.length === 0);
        }),
        { numRuns: 20 }
      );
    });
  });

  // ──────────────────────────────────────────────────────────
  // Edge Cases
  // ──────────────────────────────────────────────────────────
  describe('Edge Cases', () => {
    it('does not throw on unmount during active fetch', () => {
      const fetchFn = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: 'test' }), 1000)
          )
      );

      const { unmount } = renderHook(() => useDataFetch(fetchFn));

      expect(() => {
        unmount();
        jest.advanceTimersByTime(1000);
      }).not.toThrow();
    });

    it('uses rateLimiter.execute for every fetch call', async () => {
      const fetchFn = jest.fn().mockResolvedValue({ id: 1 });

      const { result } = renderHook(() => useDataFetch(fetchFn));
      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.refetch(); });

      expect(rateLimiter.execute).toHaveBeenCalledTimes(2);
    });
  });
});
