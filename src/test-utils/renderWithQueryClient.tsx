import React from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/** A fresh, no-retry, no-cache QueryClient for test isolation. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // staleTime: Infinity keeps initialData/mocked results from silently
      // triggering an unmocked background refetch during a test.
      queries: { retry: false, gcTime: 0, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

/**
 * Render a component under a fresh QueryClientProvider — use for any
 * component that calls a useQuery/useMutation hook.
 */
export function renderWithQueryClient(
  ui: React.ReactElement,
  options?: RenderOptions
): RenderResult & { queryClient: QueryClient } {
  const queryClient = createTestQueryClient();

  const result = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    options
  );

  return { ...result, queryClient };
}
