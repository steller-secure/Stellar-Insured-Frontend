/**
 * Error handling utilities for Stellar Insured application
 * Provides standardized error categorization, formatting, logging, and retry mechanisms
 */

// Error categories
export type ErrorCategory = 
  | 'NETWORK' 
  | 'WALLET' 
  | 'VALIDATION' 
  | 'AUTHENTICATION' 
  | 'SYSTEM' 
  | 'UNKNOWN';

// Error severity levels
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Retry policy configuration
export interface RetryPolicy {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  exponentialFactor: number;
  jitter?: boolean;
}

// Standard error structure
export interface AppError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  technicalDetails?: string;
  recoverySuggestion?: string;
  timestamp: number;
  context?: Record<string, any>;
  userActionable: boolean;
}

// Error handler configuration
export interface ErrorHandlerConfig {
  logToConsole: boolean;
  logToAnalytics: boolean;
  showUserNotifications: boolean;
  defaultRetryPolicy: RetryPolicy;
}

// Default configuration
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  logToConsole: true,
  logToAnalytics: true,
  showUserNotifications: true,
  defaultRetryPolicy: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    exponentialFactor: 2,
    jitter: true
  }
};

// Default retry policies by category
const DEFAULT_RETRY_POLICIES: Record<ErrorCategory, RetryPolicy> = {
  NETWORK: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    exponentialFactor: 2,
    jitter: true
  },
  WALLET: {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 5000,
    exponentialFactor: 1.5,
    jitter: false
  },
  VALIDATION: {
    maxRetries: 0, // No retry for validation errors
    baseDelay: 0,
    maxDelay: 0,
    exponentialFactor: 0
  },
  AUTHENTICATION: {
    maxRetries: 1,
    baseDelay: 1000,
    maxDelay: 3000,
    exponentialFactor: 1.5,
    jitter: false
  },
  SYSTEM: {
    maxRetries: 0, // No automatic retry for system errors
    baseDelay: 0,
    maxDelay: 0,
    exponentialFactor: 0
  },
  UNKNOWN: {
    maxRetries: 1,
    baseDelay: 1000,
    maxDelay: 3000,
    exponentialFactor: 1.5,
    jitter: true
  }
};

// Error messages and recovery suggestions
const ERROR_MESSAGES: Record<ErrorCategory, Record<string, { 
  message: string; 
  recoverySuggestion?: string; 
  severity: ErrorSeverity;
}>> = {
  NETWORK: {
    CONNECTION_TIMEOUT: {
      message: 'Connection timed out. Please check your internet connection.',
      recoverySuggestion: 'Check your network connection and try again.',
      severity: 'MEDIUM'
    },
    SERVER_ERROR: {
      message: 'Server is temporarily unavailable. Please try again later.',
      recoverySuggestion: 'The server may be down for maintenance. Please try again in a few minutes.',
      severity: 'HIGH'
    },
    NETWORK_ERROR: {
      message: 'Network error occurred. Please check your connection.',
      recoverySuggestion: 'Verify your internet connection is stable and try again.',
      severity: 'MEDIUM'
    }
  },
  WALLET: {
    NOT_INSTALLED: {
      message: 'Freighter wallet extension not found.',
      recoverySuggestion: 'Please install the Freighter wallet browser extension and refresh the page.',
      severity: 'HIGH'
    },
    NOT_CONNECTED: {
      message: 'Wallet is not connected.',
      recoverySuggestion: 'Please connect your wallet to continue.',
      severity: 'MEDIUM'
    },
    SIGNING_FAILED: {
      message: 'Failed to sign transaction with wallet.',
      recoverySuggestion: 'Please try again or check your wallet settings.',
      severity: 'HIGH'
    },
    USER_REJECTED: {
      message: 'Transaction was rejected by wallet.',
      recoverySuggestion: 'You cancelled the transaction. Please try again if you wish to proceed.',
      severity: 'LOW'
    }
  },
  VALIDATION: {
    INVALID_INPUT: {
      message: 'Please check your input and try again.',
      recoverySuggestion: 'Make sure all required fields are filled correctly.',
      severity: 'LOW'
    }
  },
  AUTHENTICATION: {
    SESSION_EXPIRED: {
      message: 'Your session has expired. Please sign in again.',
      recoverySuggestion: 'Sign in to continue using the application.',
      severity: 'MEDIUM'
    },
    UNAUTHORIZED: {
      message: 'You are not authorized to perform this action.',
      recoverySuggestion: 'Please sign in with appropriate permissions.',
      severity: 'HIGH'
    }
  },
  SYSTEM: {
    UNEXPECTED_ERROR: {
      message: 'An unexpected error occurred.',
      recoverySuggestion: 'Please try again. If the problem persists, contact support.',
      severity: 'HIGH'
    }
  },
  UNKNOWN: {
    GENERIC_ERROR: {
      message: 'Something went wrong.',
      recoverySuggestion: 'Please try again. If the problem continues, contact support.',
      severity: 'MEDIUM'
    }
  }
};

class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorLog: AppError[] = [];

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a standardized error object
   */
  createError(
    category: ErrorCategory,
    errorCode: string,
    originalError?: unknown,
    context?: Record<string, any>
  ): AppError {
    const errorInfo = ERROR_MESSAGES[category]?.[errorCode] || 
      ERROR_MESSAGES.UNKNOWN.GENERIC_ERROR;
    
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const appError: AppError = {
      id: errorId,
      category,
      severity: errorInfo.severity,
      message: errorInfo.message,
      code: errorCode,
      technicalDetails: this.formatTechnicalDetails(originalError),
      recoverySuggestion: errorInfo.recoverySuggestion,
      timestamp: Date.now(),
      context,
      userActionable: this.isErrorUserActionable(category, errorCode)
    };

    // Log the error
    this.logError(appError);
    
    return appError;
  }

  /**
   * Handle an error by creating AppError and optionally showing user notification
   */
  handleError(
    category: ErrorCategory,
    errorCode: string,
    originalError?: unknown,
    context?: Record<string, any>
  ): AppError {
    const appError = this.createError(category, errorCode, originalError, context);
    
    if (this.config.showUserNotifications && appError.userActionable) {
      this.showUserNotification(appError);
    }
    
    return appError;
  }

  /**
   * Retry a function with exponential backoff
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    category: ErrorCategory,
    policy?: RetryPolicy
  ): Promise<T> {
    const retryPolicy = policy || DEFAULT_RETRY_POLICIES[category] || DEFAULT_CONFIG.defaultRetryPolicy;
    
    let lastError: unknown;
    
    for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < retryPolicy.maxRetries) {
          const delay = this.calculateDelay(attempt, retryPolicy);
          await this.sleep(delay);
        }
      }
    }
    
    // If all retries failed, throw the last error
    throw lastError;
  }

  /**
   * Get retry policy for specific error category
   */
  getRetryPolicy(category: ErrorCategory): RetryPolicy {
    return DEFAULT_RETRY_POLICIES[category] || DEFAULT_CONFIG.defaultRetryPolicy;
  }

  /**
   * Log error to console and analytics
   */
  private logError(error: AppError): void {
    this.errorLog.push(error);
    
    if (this.config.logToConsole) {
      console.error(`[App Error] ${error.category} - ${error.message}`, {
        id: error.id,
        code: error.code,
        severity: error.severity,
        timestamp: new Date(error.timestamp).toISOString(),
        context: error.context
      });
    }
    
    if (this.config.logToAnalytics) {
      this.logToAnalytics(error);
    }
  }

  /**
   * Log error to analytics service
   */
  private logToAnalytics(error: AppError): void {
    // Integrate with existing analytics system
    if (typeof window !== 'undefined' && (window as any).analytics) {
      try {
        (window as any).analytics.track('error', {
          error_id: error.id,
          category: error.category,
          code: error.code,
          severity: error.severity,
          message: error.message,
          timestamp: error.timestamp,
          context: error.context
        });
      } catch (e) {
        console.error('Failed to log error to analytics:', e);
      }
    }
  }

  /**
   * Show user notification for error
   */
  private showUserNotification(error: AppError): void {
    // Integrate with toast notification system
    if (typeof window !== 'undefined' && (window as any).showToast) {
      try {
        (window as any).showToast(error.message, 'error');
      } catch (e) {
        console.error('Failed to show toast notification:', e);
      }
    }
  }

  /**
   * Format technical details from original error
   */
  private formatTechnicalDetails(error: unknown): string {
    if (!error) return '';
    
    if (error instanceof Error) {
      return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    try {
      return JSON.stringify(error, null, 2);
    } catch {
      return String(error);
    }
  }

  /**
   * Calculate delay with exponential backoff and optional jitter
   */
  private calculateDelay(attempt: number, policy: RetryPolicy): number {
    let delay = policy.baseDelay * Math.pow(policy.exponentialFactor, attempt);
    
    if (delay > policy.maxDelay) {
      delay = policy.maxDelay;
    }
    
    // Add jitter to prevent thundering herd
    if (policy.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Determine if error is user-actionable
   */
  private isErrorUserActionable(category: ErrorCategory, errorCode: string): boolean {
    const nonActionableErrors: [ErrorCategory, string][] = [
      ['SYSTEM', 'UNEXPECTED_ERROR'],
      ['NETWORK', 'SERVER_ERROR']
    ];
    
    return !nonActionableErrors.some(([cat, code]) => cat === category && code === errorCode);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): AppError[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export types and utilities
export { ERROR_MESSAGES };
export default ErrorHandler;