/**
 * Custom React hook for centralized error handling
 * Integrates with errorHandler utilities and provides React-specific error management
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  errorHandler, 
  AppError, 
  ErrorCategory, 
  RetryPolicy 
} from '@/lib/errorHandler';
import { useToast } from '@/components/ui/toast';
import { useAnalytics } from '@/hooks/useAnalytics';

export interface UseErrorHandlerOptions {
  autoLog?: boolean;
  showNotifications?: boolean;
  retryPolicy?: RetryPolicy;
}

export interface ErrorState {
  error: AppError | null;
  isLoading: boolean;
  retryCount: number;
  lastRetryTimestamp: number | null;
}

const DEFAULT_OPTIONS: UseErrorHandlerOptions = {
  autoLog: true,
  showNotifications: true,
  retryPolicy: undefined
};

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isLoading: false,
    retryCount: 0,
    lastRetryTimestamp: null
  });
  
  const { showToast } = useToast();
  const { trackError } = useAnalytics();

  /**
   * Handle an error with full error management
   */
  const handleError = useCallback((
    category: ErrorCategory,
    errorCode: string,
    originalError?: unknown,
    context?: Record<string, any>
  ) => {
    const appError = errorHandler.handleError(category, errorCode, originalError, context);
    
    setErrorState((prev: ErrorState) => ({
      error: appError,
      isLoading: false,
      retryCount: prev.retryCount,
      lastRetryTimestamp: prev.lastRetryTimestamp
    }));

    // Track error in analytics
    trackError(appError.message, {
      category: appError.category,
      code: appError.code,
      severity: appError.severity,
      context: appError.context
    });

    return appError;
  }, [trackError]);

  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isLoading: false,
      retryCount: 0,
      lastRetryTimestamp: null
    });
  }, []);

  /**
   * Execute a function with automatic error handling
   */
  const executeWithErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>,
    category: ErrorCategory,
    errorCode: string = 'GENERIC_ERROR',
    context?: Record<string, any>
  ): Promise<T | null> => {
    try {
      setErrorState((prev: ErrorState) => ({ ...prev, isLoading: true, error: null }));
      
      const result = await fn();
      
      setErrorState((prev: ErrorState) => ({ 
        ...prev, 
        isLoading: false, 
        error: null,
        retryCount: 0,
        lastRetryTimestamp: null
      }));
      
      return result;
    } catch (error) {
      const appError = handleError(category, errorCode, error, context);
      return null;
    }
  }, [handleError]);

  /**
   * Execute a function with retry logic
   */
  const executeWithRetry = useCallback(async <T>(
    fn: () => Promise<T>,
    category: ErrorCategory,
    errorCode: string = 'GENERIC_ERROR',
    context?: Record<string, any>,
    customRetryPolicy?: RetryPolicy
  ): Promise<T | null> => {
    const policy = customRetryPolicy || opts.retryPolicy || errorHandler.getRetryPolicy(category);
    
    try {
      setErrorState((prev: ErrorState) => ({ ...prev, isLoading: true, error: null }));
      
      const result = await errorHandler.retryWithBackoff(
        fn,
        category,
        policy
      );
      
      setErrorState((prev: ErrorState) => ({ 
        ...prev, 
        isLoading: false, 
        error: null,
        retryCount: 0,
        lastRetryTimestamp: null
      }));
      
      return result;
    } catch (error) {
      const appError = handleError(category, errorCode, error, {
        ...context,
        retryAttempts: policy.maxRetries + 1
      });
      
      setErrorState((prev: ErrorState) => ({
        ...prev,
        retryCount: policy.maxRetries + 1,
        lastRetryTimestamp: Date.now()
      }));
      
      return null;
    }
  }, [handleError, opts.retryPolicy]);

  /**
   * Retry the last failed operation
   */
  const retryLastOperation = useCallback(async <T>(
    fn: () => Promise<T>,
    category: ErrorCategory,
    errorCode: string = 'GENERIC_ERROR',
    context?: Record<string, any>
  ): Promise<T | null> => {
    if (!errorState.error) {
      console.warn('No error to retry');
      return null;
    }

    return executeWithRetry(fn, category, errorCode, context);
  }, [errorState.error, executeWithRetry]);

  /**
   * Show error notification to user
   */
  const showErrorNotification = useCallback((error: AppError) => {
    if (opts.showNotifications && error.userActionable) {
      showToast(error.message, 'error');
    }
  }, [opts.showNotifications, showToast]);

  /**
   * Show success notification
   */
  const showSuccessNotification = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  /**
   * Show info notification
   */
  const showInfoNotification = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  /**
   * Show warning notification
   */
  const showWarningNotification = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  /**
   * Auto-clear error after timeout
   */
  useEffect(() => {
    if (errorState.error && errorState.error.severity !== 'CRITICAL') {
      const timeoutId = setTimeout(() => {
        clearError();
      }, 10000); // Auto-clear non-critical errors after 10 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [errorState.error, clearError]);

  return {
    // Error state
    error: errorState.error,
    isLoading: errorState.isLoading,
    retryCount: errorState.retryCount,
    lastRetryTimestamp: errorState.lastRetryTimestamp,
    
    // Error handlers
    handleError,
    clearError,
    executeWithErrorHandling,
    executeWithRetry,
    retryLastOperation,
    
    // Notifications
    showErrorNotification,
    showSuccessNotification,
    showInfoNotification,
    showWarningNotification,
    
    // Utilities
    hasError: !!errorState.error,
    isRecoverable: errorState.error?.userActionable ?? false,
    canRetry: errorState.error !== null && 
              errorState.retryCount < (opts.retryPolicy?.maxRetries ?? 3)
  };
}

/**
 * Hook for handling form-specific errors
 */
export function useFormErrorHandler(formName: string) {
  const errorHandler = useErrorHandler({
    autoLog: true,
    showNotifications: true
  });

  const handleFormError = useCallback((
    errorCode: string,
    originalError?: unknown,
    field?: string
  ) => {
    return errorHandler.handleError('VALIDATION', errorCode, originalError, {
      form: formName,
      field
    });
  }, [errorHandler, formName]);

  return {
    ...errorHandler,
    handleFormError
  };
}

/**
 * Hook for handling API call errors
 */
export function useApiErrorHandler() {
  return useErrorHandler({
    autoLog: true,
    showNotifications: true,
    retryPolicy: {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 8000,
      exponentialFactor: 2,
      jitter: true
    }
  });
}

/**
 * Hook for handling wallet-related errors
 */
export function useWalletErrorHandler() {
  return useErrorHandler({
    autoLog: true,
    showNotifications: true,
    retryPolicy: {
      maxRetries: 2,
      baseDelay: 2000,
      maxDelay: 5000,
      exponentialFactor: 1.5,
      jitter: false
    }
  });
}

export default useErrorHandler;