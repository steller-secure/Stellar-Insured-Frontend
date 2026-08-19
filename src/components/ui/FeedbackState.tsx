import React from "react";
import { cn, staticSurfaceRecipe } from "@/design-system";
import type { UIColor } from "@/design-system";
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

const VARIANT_COLORS: Record<FeedbackVariant, UIColor> = {
  loading: "primary",
  empty: "neutral",
  error: "error",
};

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
      description: "We're fetching the latest data for you.",
    },
    empty: {
      title: "Nothing here yet",
      description: "There's no data to show in this section right now.",
    },
    error: {
      title: "Something went wrong",
      description: "We couldn't load this content. Please try again.",
    },
  };

  const copy = defaults[variant];
  const color = VARIANT_COLORS[variant];

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-border bg-surface-sunken px-6 py-10 text-center"
      role={variant === "error" ? "alert" : "status"}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-card",
          staticSurfaceRecipe.soft[color],
        )}
      >
        {variant === "loading" && (
          <svg
            className="h-6 w-6 animate-spin motion-reduce:animate-none"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
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
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
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
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
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
        <p className="text-base font-semibold text-fg">{title ?? copy.title}</p>
        <p className="mt-1 text-sm text-fg-muted">
          {description ?? copy.description}
        </p>
      </div>

      {/* Error-specific content */}
      {variant === "error" && (
        <div className="flex w-full max-w-md flex-col gap-4">
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction} fullWidth>
              {actionLabel}
            </Button>
          )}

          {showRetryButton && onRetry && retryCount < maxRetries && (
            <Button variant="outline" size="sm" onClick={onRetry} fullWidth>
              {retryCount > 0 ? `Retry (${retryCount}/${maxRetries})` : "Try Again"}
            </Button>
          )}

          {errorCode && (
            <div className="rounded-field bg-surface-raised px-2 py-1 font-mono text-xs text-fg-subtle">
              Error Code: {errorCode}
            </div>
          )}

          {recoverySuggestion && (
            <div
              className={cn(
                "rounded-field border border-current/20 p-3 text-left",
                staticSurfaceRecipe.soft.info,
              )}
            >
              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium">Suggestion</p>
                  <p className="mt-1 text-sm">{recoverySuggestion}</p>
                </div>
              </div>
            </div>
          )}

          {showTechnicalDetails && technicalDetails && (
            <details className="rounded-field bg-surface-raised p-3 text-left">
              <summary className="cursor-pointer text-xs font-medium text-fg-muted">
                Technical Details
              </summary>
              <pre className="mt-2 overflow-x-auto text-xs whitespace-pre-wrap text-fg-muted">
                {technicalDetails}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};
