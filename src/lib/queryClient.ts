/**
 * TanStack Query client factory.
 *
 * Centralizes retry/cache defaults for all server-state queries and
 * mutations. Queries retry transient failures with backoff; mutations do
 * not auto-retry (the existing useTransactionHandler already owns
 * user-facing retry UX for writes).
 */

import { QueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api-client';

const MAX_QUERY_RETRIES = 2;

function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.retryable;
  }
  // Non-ApiClientError failures (e.g. from mock/localStorage-backed
  // services) don't carry retry metadata — default to retrying them.
  return true;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: (failureCount, error) =>
          failureCount < MAX_QUERY_RETRIES && isRetryableError(error),
      },
      mutations: {
        retry: false,
      },
    },
  });
}
