'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { errorHandler } from '@/lib/errorHandler';
import { analytics } from '@/lib/analytics';
import { useNotificationContext } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'global' | 'route';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  category: ErrorCategory;
  severity: ErrorSeverity;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      category: 'SYSTEM',
      severity: 'HIGH'
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      category: 'SYSTEM',
      severity: 'HIGH'
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log the error to analytics
    analytics.trackError(error, {
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      timestamp: Date.now()
    });

    // Standardize and notify on boundary errors
    const appError = errorHandler.handleError(
      'SYSTEM',
      'UNEXPECTED_ERROR',
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        level: this.props.level || 'global'
      }
    );

    // Show user notification for actionable errors
    if (appError.userActionable) {
      const { addNotification } = useNotificationContext();
      if (addNotification) {
        addNotification(appError.message, appError.severity === 'CRITICAL' ? 'error' : 'warning');
      }
    }

    // Send to monitoring endpoint
    errorHandler.sendToMonitoringEndpoint(appError).catch(() => {
      // Silently fail
    });

    console.error('ErrorBoundary caught an error:', error, errorInfo, appError);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      category: 'SYSTEM',
      severity: 'HIGH'
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-4">
          <Card variant="solid" elevation={2} className="max-w-2xl w-full">
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-pill bg-error-soft text-error-on-soft">
                  <svg 
                    className="w-8 h-8" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-fg mb-2">
                  Something went wrong
                </h2>
                <p className="text-fg-muted mb-6">
                  We're sorry, but something unexpected happened. Our team has been notified.
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={this.handleRetry}
                  fullWidth
                >
                  Try Again
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  fullWidth
                >
                  Refresh Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-8 bg-surface-sunken rounded-card p-4 text-left">
                  <summary className="text-fg-muted font-medium cursor-pointer">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 text-sm text-fg-subtle">
                    <p className="font-mono mb-2">{this.state.error.toString()}</p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="whitespace-pre-wrap overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components that need error boundary functionality
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);
  const { addNotification } = useNotificationContext();
  const router = useRouter();

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const ErrorFallback = React.useCallback(({ children }: { children: ReactNode }) => {
    if (error) {
      return (
        <div className="p-4 bg-error-soft text-error-on-soft border border-current/20 rounded-card">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-medium mb-1">Component Error</h4>
              <p className="text-sm mb-3">
                {error.message}
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={resetError}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }, [error, resetError]);

  return {
    error,
    handleError,
    resetError,
    ErrorFallback,
    router
  };
}

// Export the main ErrorBoundary component
export const ErrorBoundary = ErrorBoundaryClass;

// Export types
export type { Props as ErrorBoundaryProps, State as ErrorBoundaryState };

export default ErrorBoundary;