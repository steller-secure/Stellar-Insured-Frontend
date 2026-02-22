import { renderHook, act } from '@testing-library/react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Mock dependencies
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    showToast: jest.fn()
  })
}));

jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackError: jest.fn()
  })
}));

describe('useErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle error and update state', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleError('NETWORK', 'CONNECTION_TIMEOUT');
      });
      
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.category).toBe('NETWORK');
      expect(result.current.error?.code).toBe('CONNECTION_TIMEOUT');
      expect(result.current.hasError).toBe(true);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      act(() => {
        result.current.handleError('NETWORK', 'CONNECTION_TIMEOUT');
      });
      
      expect(result.current.hasError).toBe(true);
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('executeWithErrorHandling', () => {
    it('should execute function successfully', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockFn = jest.fn().mockResolvedValue('success');
      
      let executionResult: string | null = null;
      await act(async () => {
        executionResult = await result.current.executeWithErrorHandling(
          mockFn,
          'NETWORK',
          'GENERIC_ERROR'
        );
      });
      
      expect(executionResult).toBe('success');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
    });

    it('should handle function error', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));
      
      let executionResult: string | null = null;
      await act(async () => {
        executionResult = await result.current.executeWithErrorHandling(
          mockFn,
          'NETWORK',
          'CONNECTION_TIMEOUT'
        );
      });
      
      expect(executionResult).toBeNull();
      expect(result.current.hasError).toBe(true);
      expect(result.current.error?.message).toContain('Connection timed out');
    });
  });

  describe('executeWithRetry', () => {
    it('should retry function and succeed', async () => {
      const { result } = renderHook(() => useErrorHandler());
      let attempt = 0;
      const mockFn = jest.fn().mockImplementation(() => {
        attempt++;
        if (attempt < 2) {
          throw new Error('Failed');
        }
        return 'success';
      });
      
      let executionResult: string | null = null;
      await act(async () => {
        executionResult = await result.current.executeWithRetry(
          mockFn,
          'NETWORK',
          'GENERIC_ERROR',
          undefined,
          { maxRetries: 2, baseDelay: 1, maxDelay: 10, exponentialFactor: 1 }
        );
      });
      
      expect(executionResult).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      let executionResult: string | null = null;
      await act(async () => {
        executionResult = await result.current.executeWithRetry(
          mockFn,
          'NETWORK',
          'CONNECTION_TIMEOUT',
          undefined,
          { maxRetries: 1, baseDelay: 1, maxDelay: 10, exponentialFactor: 1 }
        );
      });
      
      expect(executionResult).toBeNull();
      expect(result.current.hasError).toBe(true);
      expect(mockFn).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });
  });

  describe('retryLastOperation', () => {
    it('should retry last failed operation', async () => {
      const { result } = renderHook(() => useErrorHandler());
      const mockFn = jest.fn().mockResolvedValue('retry success');
      
      // First, fail an operation
      await act(async () => {
        await result.current.executeWithErrorHandling(
          () => Promise.reject(new Error('Initial fail')),
          'NETWORK',
          'CONNECTION_TIMEOUT'
        );
      });
      
      expect(result.current.hasError).toBe(true);
      expect(result.current.canRetry).toBe(true);
      
      // Then retry it
      let retryResult: string | null = null;
      await act(async () => {
        retryResult = await result.current.retryLastOperation(
          mockFn,
          'NETWORK',
          'GENERIC_ERROR'
        );
      });
      
      expect(retryResult).toBe('retry success');
      expect(result.current.hasError).toBe(false);
    });
  });

  describe('notification methods', () => {
    it('should have notification methods', () => {
      const { result } = renderHook(() => useErrorHandler());
      
      expect(typeof result.current.showErrorNotification).toBe('function');
      expect(typeof result.current.showSuccessNotification).toBe('function');
      expect(typeof result.current.showInfoNotification).toBe('function');
      expect(typeof result.current.showWarningNotification).toBe('function');
    });
  });
});