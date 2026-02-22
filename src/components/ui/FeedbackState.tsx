import React from "react";
import { Button } from "./Button";

type FeedbackVariant = "loading" | "empty" | "error";

interface FeedbackStateProps {
  variant: FeedbackVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  errorCode?: string;
  recoverySuggestion?: string;
  showTechnicalDetails?: boolean;
  technicalDetails?: string;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export const FeedbackState: React.FC<FeedbackStateProps> = ({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  errorCode,
  recoverySuggestion,
  showTechnicalDetails = false,
  technicalDetails,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  showRetryButton = true,
}) => {
  const defaults: Record<
    FeedbackVariant,
    { title: string; description: string }
  > = {
    loading: {
      title: "Loading",
      description: "We’re fetching the latest data for you.",
    },
    empty: {
      title: "Nothing here yet",
      description: "There’s no data to show in this section right now.",
    },
    error: {
      title: "Something went wrong",
      description: "We couldn't load this content. Please try again.",
    },
  };

  const copy = defaults[variant];

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-6 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-brand-primary">
        {variant === "loading" && (
          <svg
            className="h-6 w-6 animate-spin text-brand-primary"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {variant === "empty" && (
          <svg
            className="h-6 w-6 text-brand-primary"
            viewBox="0 0 24 24"
            fill="none"
          >
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M3 10h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
        {variant === "error" && (
          <svg
            className="h-6 w-6 text-rose-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 7v6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
        )}
      </div>

      <div>
        <p className="text-base font-semibold text-white">
          {title ?? copy.title}
        </p>
        <p className="mt-1 text-sm text-brand-text-muted">
          {description ?? copy.description}
        </p>
      </div>

      {/* Error-specific content */}
      {variant === "error" && (
        <div className="flex flex-col gap-4 w-full max-w-md">
          {/* Action button */}
          {actionLabel && onAction && (
            <Button size="sm" variant="primary" onClick={onAction} className="w-full">
              {actionLabel}
            </Button>
          )}
          
          {/* Retry button */}
          {showRetryButton && onRetry && retryCount < maxRetries && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onRetry}
              className="w-full"
            >
              {retryCount > 0 ? `Retry (${retryCount}/${maxRetries})` : "Try Again"}
            </Button>
          )}
          
          {/* Error code */}
          {errorCode && (
            <div className="text-xs text-slate-500 font-mono bg-slate-900/50 rounded px-2 py-1">
              Error Code: {errorCode}
            </div>
          )}
          
          {/* Recovery suggestion */}
          {recoverySuggestion && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-left">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-100">Suggestion</p>
                  <p className="text-sm text-blue-200 mt-1">
                    {recoverySuggestion}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Technical details */}
          {showTechnicalDetails && technicalDetails && (
            <details className="bg-slate-900/30 rounded-lg p-3 text-left">
              <summary className="text-xs text-slate-400 font-medium cursor-pointer">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap overflow-x-auto">
                {technicalDetails}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

