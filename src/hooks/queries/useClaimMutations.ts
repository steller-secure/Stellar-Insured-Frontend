'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimApi } from '@/services/api/claimApi';
import type { Claim, ClaimCreationRequest } from '@/types/api';
import { queryKeys } from './queryKeys';

function toOptimisticClaim(request: ClaimCreationRequest, policyName: string): Claim {
  return {
    id: `optimistic-${Date.now()}`,
    policyId: request.policyId,
    policyName,
    incidentType: request.incidentType,
    amount: request.amount,
    amountFormatted: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(request.amount),
    dateFiled: new Date().toISOString(),
    status: 'Pending',
    description: request.description,
    evidence: request.evidence,
    walletAddress: request.walletAddress,
  };
}

interface CreateClaimVariables {
  request: ClaimCreationRequest;
  /** Display name for the optimistic list entry (real data is a plain policyId). */
  policyName: string;
}

/**
 * Submit a new claim via the real claimApi.create() endpoint, with an
 * optimistic insert into the claims list — the submitted claim appears in
 * ClaimTrackingDashboard immediately, and rolls back if submission fails.
 */
export function useCreateClaimMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ request }: CreateClaimVariables) => {
      const response = await claimApi.create(request, { retries: 0 });
      return response.data;
    },
    onMutate: async ({ request, policyName }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.claims.list });

      const previousClaims = queryClient.getQueryData<Claim[]>(queryKeys.claims.list);
      queryClient.setQueryData<Claim[]>(queryKeys.claims.list, (current) => [
        toOptimisticClaim(request, policyName),
        ...(current ?? []),
      ]);

      return { previousClaims };
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(queryKeys.claims.list, context.previousClaims);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claims.all });
    },
  });
}
