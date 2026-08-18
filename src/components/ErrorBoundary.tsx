'use client';

import React, { Component, ErrorInfo, ReactNode, useId } from 'react';
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

// ── Error fallback rendered by the class boundary ────────────────────────────
// Extracted as a separate functional component so it can use the useId hook
// and produce stable, unique IDs for aria-labelledby / aria-describedby.
// Using a hook inside a class component is invalid per the Rules of Hooks.
interface ErrorFallbackUIProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
  onReload: () => void;
}

function ErrorFallbackUI({
  error,
  errorInfo,
  onRetry,
  onReload,
}: ErrorFallbackUIProps) {
  const titleId = useId();
  const descId = useId();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-surface p-4"
      role="alert"
      aria-live="assertive"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <Card variant="solid" elevation={2} className="max-w-2xl w-full">
        <div className="p-8 text-center">
          <div className="mb-6">
            <div
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-pill bg-error-soft text-error-on-soft"
              aria-hidden="true"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2
              id={titleId}
              className="text-2xl font-bold text-fg mb-2"
            >
              Something went wrong
            </h2>

            <p id={descId} className="text-fg-muted mb-6">
              We&apos;re sorry, but something unexpected happened. Our team has
              been notified.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={onRetry} fullWidth>
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={onReload}
              fullWidth
            >
              Refresh Page
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-8 bg-surface-sunken rounded-card p-4 text-left">
              <summary className="text-fg-muted font-medium cursor-pointer">
                Error Details (Development Only)
              </summary>

              <div className="mt-2 text-sm text-fg-subtle">
                <p className="font-mono mb-2">
                  {error.toString()}
                </p>

                {errorInfo?.componentStack && (
                  <pre className="whitespace-pre-wrap overflow-x-auto">
                    {errorInfo.componentStack}
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

// ── Inline functional error fallback ────────────────────────────────────────
// Kept separate from the callback to ensure hooks are used inside a valid
// functional component.
interface ComponentErrorFallbackProps {
  error: Error;
  onReset: () => void;
}

function ComponentErrorFallback({
  error,
  onReset,
}: ComponentErrorFallbackProps) {
  const titleId = useId();

  return (
    <div
      className="p-4 bg-error-soft text-error-on-soft border border-current/20 rounded-card"
      role="alert"
      aria-labelledby={titleId}
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 mt-0.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <div>
          <h4 id={titleId} className="font-medium mb-1">
            Component Error
          </h4>

          <p className="text-sm mb-3">
            {error.message}
          </p>

          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      category: 'SYSTEM',
      severity: 'HIGH',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      category: 'SYSTEM',
      severity: 'HIGH',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log to analytics
    analytics.trackError(error, {
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      timestamp: Date.now(),
    });

    // Standardize the error via errorHandler
    const appError = errorHandler.handleError(
      'SYSTEM',
      'UNEXPECTED_ERROR',
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        level: this.props.level || 'global',
      }
    );

    // Hooks cannot be called inside class component methods.
    // User-actionable notifications are handled by the root-level
    // notification infrastructure.
    //
    // See useErrorBoundary() below for the functional equivalent.

    // Send to monitoring
    errorHandler
      .sendToMonitoringEndpoint(appError)
      .catch(() => {
        // Silent failure
      });

    console.error(
      'ErrorBoundary caught an error:',
      error,
      errorInfo,
      appError
    );

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
      severity: 'HIGH',
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallbackUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
        />
      );
    }

    return this.props.children;
  }
}

// ── Functional hook version for use inside functional components ─────────────
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);
  const { addNotification } = useNotificationContext();
  const router = useRouter();

  const handleError = React.useCallback((err: Error) => {
    setError(err);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const ErrorFallback = React.useCallback(
    ({ children }: { children: ReactNode }) => {
      if (error) {
        return (
          <ComponentErrorFallback
            error={error}
            onReset={resetError}
          />
        );
      }

      return <>{children}</>;
    },
    [error, resetError]
  );

  return {
    error,
    handleError,
    resetError,
    ErrorFallback,
    router,
    addNotification,
  };
}

// Export the main ErrorBoundary component
export const ErrorBoundary = ErrorBoundaryClass;

// Export types
export type {
  Props as ErrorBoundaryProps,
  State as ErrorBoundaryState,
};

export default ErrorBoundary;