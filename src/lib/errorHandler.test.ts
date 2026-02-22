import { errorHandler, AppError } from '@/lib/errorHandler';

describe('errorHandler', () => {
  beforeEach(() => {
    // Clear any existing errors
    errorHandler.clearErrorLog();
  });

  describe('createError', () => {
    it('should create a standardized error object', () => {
      const error = errorHandler.createError('NETWORK', 'CONNECTION_TIMEOUT');
      
      expect(error).toMatchObject({
        category: 'NETWORK',
        code: 'CONNECTION_TIMEOUT',
        severity: 'MEDIUM',
        message: 'Connection timed out. Please check your internet connection.',
        userActionable: true
      });
      expect(error.id).toBeDefined();
      expect(error.timestamp).toBeDefined();
    });

    it('should handle unknown error codes', () => {
      const error = errorHandler.createError('UNKNOWN' as any, 'NONEXISTENT_CODE');
      
      expect(error.message).toBe('Something went wrong.');
      expect(error.severity).toBe('MEDIUM');
    });

    it('should include technical details from original error', () => {
      const originalError = new Error('Test error');
      const error = errorHandler.createError('SYSTEM', 'UNEXPECTED_ERROR', originalError);
      
      expect(error.technicalDetails).toContain('Test error');
    });
  });

  describe('handleError', () => {
    it('should create error and potentially show notification', () => {
      const error = errorHandler.handleError('WALLET', 'NOT_INSTALLED');
      
      expect(error.category).toBe('WALLET');
      expect(error.code).toBe('NOT_INSTALLED');
    });
  });

  describe('retryWithBackoff', () => {
    it('should retry function with exponential backoff', async () => {
      let attempt = 0;
      const mockFn = jest.fn().mockImplementation(() => {
        attempt++;
        if (attempt < 3) {
          throw new Error('Failed');
        }
        return 'success';
      });

      const result = await errorHandler.retryWithBackoff(
        mockFn,
        'NETWORK',
        { maxRetries: 3, baseDelay: 1, maxDelay: 10, exponentialFactor: 1 }
      );

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      await expect(
        errorHandler.retryWithBackoff(
          mockFn,
          'NETWORK',
          { maxRetries: 2, baseDelay: 1, maxDelay: 10, exponentialFactor: 1 }
        )
      ).rejects.toThrow('Always fails');
      
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('getRetryPolicy', () => {
    it('should return appropriate retry policy for category', () => {
      const networkPolicy = errorHandler.getRetryPolicy('NETWORK');
      const walletPolicy = errorHandler.getRetryPolicy('WALLET');
      
      expect(networkPolicy.maxRetries).toBe(3);
      expect(walletPolicy.maxRetries).toBe(2);
    });

    it('should return default policy for unknown category', () => {
      const policy = errorHandler.getRetryPolicy('UNKNOWN' as any);
      expect(policy.maxRetries).toBe(1);
    });
  });

  describe('getRecentErrors', () => {
    it('should return recent errors', () => {
      errorHandler.createError('NETWORK', 'CONNECTION_TIMEOUT');
      errorHandler.createError('WALLET', 'NOT_INSTALLED');
      
      const errors = errorHandler.getRecentErrors();
      expect(errors).toHaveLength(2);
      expect(errors[0].category).toBe('NETWORK');
      expect(errors[1].category).toBe('WALLET');
    });

    it('should limit returned errors', () => {
      // Create more errors than limit
      for (let i = 0; i < 15; i++) {
        errorHandler.createError('NETWORK', 'CONNECTION_TIMEOUT');
      }
      
      const errors = errorHandler.getRecentErrors(10);
      expect(errors).toHaveLength(10);
    });
  });
});