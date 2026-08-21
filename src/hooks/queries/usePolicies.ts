'use client';

import { useQuery } from '@tanstack/react-query';
import { policyService } from '@/services/policyService';
import type { PolicyFilterOptions } from '@/services/types/policy.types';
import { queryKeys } from './queryKeys';

/**
 * Fetch the (optionally filtered) policy list. Wraps the same
 * policyService.getPolicies() call every consumer already used, so the
 * mock/live data-source switch in DataService is unaffected.
 */
export function usePoliciesQuery(options?: PolicyFilterOptions) {
  return useQuery({
    queryKey: queryKeys.policies.list(options),
    queryFn: async () => {
      const response = await policyService.getPolicies(options);
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to load policies');
      }
      return response.data;
    },
  });
}

/** Fetch a single policy by id. */
export function usePolicyQuery(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.policies.detail(id ?? ''),
    queryFn: async () => {
      const response = await policyService.getPolicyById(id as string);
      if (!response.success || !response.data) {
        throw new Error(response.error ?? 'Policy not found');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

/** Fetch aggregate policy statistics for the current user. */
export function usePolicyStatsQuery() {
  return useQuery({
    queryKey: queryKeys.policies.stats,
    queryFn: async () => {
      const response = await policyService.getPolicyStatistics();
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to load policy statistics');
      }
      return response.data;
    },
  });
}
