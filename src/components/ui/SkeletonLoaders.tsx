/**
 * Skeleton Loading Components
 * 
 * Reusable skeleton loaders that match the structure of real components.
 * Used to provide better UX during data fetching.
 */

/**
 * Generic skeleton pulse animation component
 */
export function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-700/40 rounded ${className}`} />
  );
}

/**
 * Policy Card Skeleton
 */
export function PolicyCardSkeleton() {
  return (
    <div className="border border-gray-700/50 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-6 w-3/4" />
          <SkeletonPulse className="h-4 w-1/2" />
        </div>
        <SkeletonPulse className="h-8 w-24" />
      </div>
      <div className="space-y-2 pt-4 border-t border-gray-700/30">
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-5/6" />
      </div>
      <div className="flex gap-2 pt-2">
        <SkeletonPulse className="h-10 flex-1" />
        <SkeletonPulse className="h-10 flex-1" />
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
        <div key={i} className="border border-gray-700/50 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <SkeletonPulse className="h-5 w-1/3" />
            <SkeletonPulse className="h-6 w-20" />
          </div>
          <div className="space-y-2">
            <SkeletonPulse className="h-4 w-full" />
            <SkeletonPulse className="h-4 w-4/5" />
          </div>
          <SkeletonPulse className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table Skeleton - for data tables
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-700/50">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonPulse key={`header-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex gap-4 p-4 border-b border-gray-700/30">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <SkeletonPulse key={`cell-${rowIdx}-${colIdx}`} className="h-4 flex-1" />
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
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-lg p-6 space-y-4">
      <SkeletonPulse className="h-6 w-1/2" />
      <SkeletonPulse className="h-10 w-3/4" />
      <SkeletonPulse className="h-4 w-full" />
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
          <SkeletonPulse className="h-4 w-1/4" />
          <SkeletonPulse className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <SkeletonPulse className="h-10 flex-1" />
        <SkeletonPulse className="h-10 flex-1" />
      </div>
    </div>
  );
}

/**
 * Generic Loading State Container
 * Shows a centered loader with optional message
 */
export function LoadingState({ 
  message = 'Loading data...',
  size = 'md'
}: { 
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-2 border-gray-700 border-t-blue-500 ${sizeClasses[size]}`} />
      {message && <p className="mt-4 text-gray-400 text-sm">{message}</p>}
    </div>
  );
}

/**
 * Empty State
 */
export function EmptyState({ 
  title = 'No data available',
  description = 'There is nothing to display right now.',
}: { 
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg className="w-12 h-12 text-gray-600 mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.118 3.878A3 3 0 00.5 6.35v7.3a3 3 0 003.618 2.472V20a1 1 0 001.414-1.414L5.5 18.086V4.118A3.001 3.001 0 014.118 3.878zM15.746 6.908a.75.75 0 10-1.492 0v5.5a.75.75 0 001.492 0v-5.5zM13.5 11.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0v-1.5zm2.5-4a.75.75 0 10-1.5 0v8.5a.75.75 0 001.5 0v-8.5z" clipRule="evenodd" />
      </svg>
      <h3 className="font-semibold text-gray-300">{title}</h3>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </div>
  );
}

/**
 * Error State
 */
export function ErrorState({ 
  title = 'Error loading data',
  description = 'Please try again later or contact support.',
  onRetry,
}: { 
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg className="w-12 h-12 text-red-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <h3 className="font-semibold text-gray-300">{title}</h3>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
