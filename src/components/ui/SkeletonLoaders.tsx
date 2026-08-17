/**
 * Composite skeleton loaders.
 *
 * Every placeholder below is assembled from the `Skeleton` primitive so the
 * tint, radius and animation live in exactly one place.
 */

import { Button } from "./Button";
import { Skeleton } from "./Skeleton";

/**
 * @deprecated Use `Skeleton` directly. Kept as a thin alias so existing call
 * sites keep working.
 */
export function SkeletonPulse({ className = "" }: { className?: string }) {
  return <Skeleton shape="rect" className={className} />;
}

const panel = "rounded-card border border-border bg-surface-raised p-6";

/**
 * Policy Card Skeleton
 */
export function PolicyCardSkeleton() {
  return (
    <div className={`${panel} space-y-4`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton shape="text" className="h-6 w-3/4" />
          <Skeleton shape="text" className="w-1/2" />
        </div>
        <Skeleton shape="pill" className="h-8 w-24" />
      </div>
      <div className="space-y-2 border-t border-border-subtle pt-4">
        <Skeleton shape="text" className="w-full" />
        <Skeleton shape="text" className="w-5/6" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

/**
 * Claims List Skeleton
 */
export function ClaimsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-card border border-border bg-surface-raised p-4"
        >
          <div className="flex justify-between">
            <Skeleton shape="text" className="h-5 w-1/3" />
            <Skeleton shape="pill" className="h-6 w-20" />
          </div>
          <Skeleton shape="text" lines={2} />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table Skeleton - for data tables
 */
export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="w-full space-y-2">
      <div className="flex gap-4 border-b border-border p-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`header-${i}`} shape="text" className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          className="flex gap-4 border-b border-border-subtle p-4"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton
              key={`cell-${rowIdx}-${colIdx}`}
              shape="text"
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Card Skeleton
 */
export function DashboardCardSkeleton() {
  return (
    <div className={`${panel} space-y-4`}>
      <Skeleton shape="text" className="h-6 w-1/2" />
      <Skeleton shape="text" className="h-10 w-3/4" />
      <Skeleton shape="text" className="w-full" />
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton shape="text" className="w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

/**
 * Generic Loading State Container
 * Shows a centered loader with optional message
 */
export function LoadingState({
  message = "Loading data...",
  size = "md",
}: {
  message?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-12"
      role="status"
    >
      <div
        className={`animate-spin rounded-pill border-2 border-border border-t-primary motion-reduce:animate-none ${sizeClasses[size]}`}
      />
      {message && <p className="mt-4 text-sm text-fg-muted">{message}</p>}
    </div>
  );
}

/**
 * Empty State
 */
export function EmptyState({
  title = "No data available",
  description = "There is nothing to display right now.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg
        className="mb-4 h-12 w-12 text-fg-subtle"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path strokeLinecap="round" d="M3 10h18" />
      </svg>
      <h3 className="font-semibold text-fg">{title}</h3>
      <p className="mt-1 text-sm text-fg-muted">{description}</p>
    </div>
  );
}

/**
 * Error State
 */
export function ErrorState({
  title = "Error loading data",
  description = "Please try again later or contact support.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg
        className="mb-4 h-12 w-12 text-error"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <h3 className="font-semibold text-fg">{title}</h3>
      <p className="mt-1 text-sm text-fg-muted">{description}</p>
      {onRetry && (
        <Button color="error" size="sm" onClick={onRetry} className="mt-4">
          Try Again
        </Button>
      )}
    </div>
  );
}

/**
 * Proposal Card Skeleton - for DAO proposals
 */
export function ProposalCardSkeleton() {
  return (
    <div className={`${panel} space-y-4`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton shape="text" className="h-6 w-3/4" />
          <Skeleton shape="text" className="w-1/2" />
        </div>
        <Skeleton shape="pill" className="h-8 w-24" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton shape="text" lines={3} />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

/**
 * Stats Card Skeleton - for dashboard statistics
 */
export function StatsCardSkeleton() {
  return (
    <div className={`${panel} space-y-3`}>
      <Skeleton shape="text" className="w-1/2" />
      <Skeleton shape="text" className="h-8 w-3/4" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

/**
 * Analytics Skeleton - for analytics dashboard
 */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${panel} space-y-4`}>
          <Skeleton shape="text" className="h-5 w-1/3" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton shape="text" className="w-1/2" />
                  <Skeleton shape="text" className="w-8" />
                </div>
                <Skeleton shape="pill" className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className={`${panel} space-y-4 lg:col-span-2`}>
          <Skeleton shape="text" className="h-5 w-1/4" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
