"use client";

<<<<<<< HEAD
import React, { Component, ErrorInfo, ReactNode, useId } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { errorHandler } from '@/lib/errorHandler';
import { analytics } from '@/lib/analytics';
import { useNotificationContext } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
=======
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { errorHandler, ErrorCategory, ErrorSeverity } from "@/lib/errorHandler";
import { analytics } from "@/lib/analytics";
import { useNotificationContext } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: "global" | "route";
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

function ErrorFallbackUI({ error, errorInfo, onRetry, onReload }: ErrorFallbackUIProps) {
  const titleId = useId();
  const descId  = useId();

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-900 p-4"
      role="alert"
      aria-live="assertive"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <Card className="max-w-2xl w-full bg-slate-800 border-slate-700">
        <div className="p-8 text-center">
          <div className="mb-6">
            <div
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20"
              aria-hidden="true"
            >
              <svg
                className="w-8 h-8 text-red-400"
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

            {/* aria-labelledby points to this heading — WCAG 1.3.1, 4.1.2 */}
            <h2 id={titleId} className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h2>
            <p id={descId} className="text-slate-300 mb-6">
              We&apos;re sorry, but something unexpected happened. Our team has been notified.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              variant="primary"
              onClick={onRetry}
              className="w-full"
            >
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={onReload}
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-8 bg-slate-900/50 rounded-lg p-4 text-left">
              <summary className="text-slate-300 font-medium cursor-pointer">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 text-sm text-slate-400">
                <p className="font-mono mb-2">{error.toString()}</p>
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

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      category: "SYSTEM",
      severity: "HIGH",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      category: "SYSTEM",
      severity: "HIGH",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
<<<<<<< HEAD
    this.setState({ error, errorInfo });
=======
    this.setState({
      error,
      errorInfo,
    });
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)

    // Log to analytics
    analytics.trackError(error, {
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      timestamp: Date.now(),
    });

    // Standardize the error via errorHandler
    const appError = errorHandler.handleError(
      "SYSTEM",
      "UNEXPECTED_ERROR",
      error,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        level: this.props.level || "global",
      },
    );

<<<<<<< HEAD
    // NOTE: Hooks (useNotificationContext) cannot be called inside class
    // component methods. User-actionable notifications for boundary errors are
    // handled by the root-level toast infrastructure via errorHandler, or by
    // wrapping pages in a functional component that reads from the context.
    // See useErrorBoundary() below for the functional equivalent.

    // Send to monitoring
    errorHandler.sendToMonitoringEndpoint(appError).catch(() => { /* silent */ });

    console.error('ErrorBoundary caught an error:', error, errorInfo, appError);
=======
    console.error("ErrorBoundary caught an error:", error, errorInfo, appError);
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      category: "SYSTEM",
      severity: "HIGH",
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
<<<<<<< HEAD
        <ErrorFallbackUI
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onReload={() => window.location.reload()}
        />
=======
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
          <Card className="max-w-2xl w-full bg-slate-800 border-slate-700">
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                  <svg
                    className="w-8 h-8 text-red-400"
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
                <h2 className="text-2xl font-bold text-white mb-2">
                  Something went wrong
                </h2>
                <p className="text-slate-300 mb-6">
                  We're sorry, but something unexpected happened. Our team has
                  been notified.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  variant="primary"
                  onClick={this.handleRetry}
                  className="w-full"
                >
                  Try Again
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Refresh Page
                </Button>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-8 bg-slate-900/50 rounded-lg p-4 text-left">
                  <summary className="text-slate-300 font-medium cursor-pointer">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 text-sm text-slate-400">
                    <p className="font-mono mb-2">
                      {this.state.error.toString()}
                    </p>
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
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)
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
<<<<<<< HEAD
      const titleId = React.useId();

      if (error) {
        return (
          <div
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
            role="alert"
            aria-labelledby={titleId}
          >
=======
      if (error) {
        return (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
<<<<<<< HEAD
                aria-hidden="true"
=======
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
<<<<<<< HEAD
                <h4 id={titleId} className="font-medium text-red-100 mb-1">
=======
                <h4 className="font-medium text-red-100 mb-1">
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)
                  Component Error
                </h4>
                <p className="text-sm text-red-200 mb-3">{error.message}</p>
                <Button size="sm" variant="outline" onClick={resetError}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        );
      }
      return <>{children}</>;
    },
    [error, resetError],
  );

<<<<<<< HEAD
  return { error, handleError, resetError, ErrorFallback, router, addNotification };
=======
  return {
    error,
    handleError,
    resetError,
    ErrorFallback,
    router,
  };
>>>>>>> 14fea72 (fix: add Zod schemas, typed API clients, and runtime validation across services and hooks)
}

// Export the main ErrorBoundary component
export const ErrorBoundary = ErrorBoundaryClass;

// Export types
export type { Props as ErrorBoundaryProps, State as ErrorBoundaryState };

export default ErrorBoundary;
