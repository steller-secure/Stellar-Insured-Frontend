'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PolicyPlan } from '@/data/policies/listing/policy-plans-mock';
import type { Policy, PolicyListResponse } from '@/services/types/policy.types';
import type { PolicyCategoryId } from '@/types/policies/policy-listing';
import type { PolicyType } from '@/services/types/policy.types';
import { queryKeys } from './queryKeys';

// The purchase-flow mock data model (PolicyCategoryId) and the policy
// service's data model (PolicyType) predate each other and don't share an
// enum — this mapping is best-effort and only backs the *optimistic* record
// removed as soon as the real list is refetched.
const CATEGORY_TO_POLICY_TYPE: Record<PolicyCategoryId, PolicyType> = {
  health: 'Health',
  vehicle: 'Auto',
  property: 'Home',
  travel: 'Travel',
  crypto: 'Home',
};

function toOptimisticPolicy(plan: PolicyPlan): Policy {
  return {
    id: `optimistic-${plan.id}-${plan.policyNumber}`,
    name: plan.name,
    type: CATEGORY_TO_POLICY_TYPE[plan.categoryId] ?? 'Home',
    status: 'pending',
    coverageLimit: 0,
    coverageLimitFormatted: plan.coverage,
    policyNumber: plan.policyNumber,
    premium: plan.premiumAmount,
    expiryDate: plan.endDate,
    description: plan.description,
  };
}

interface PurchasePolicyVariables {
  plan: PolicyPlan;
  /** Resolves with the transaction hash, or rejects on failure. */
  purchase: () => Promise<string>;
}

interface PurchaseSnapshot {
  previousLists: Array<[readonly unknown[], PolicyListResponse | undefined]>;
}

/**
 * Wraps the policy-purchase flow (currently a simulated on-chain
 * transaction — see PolicyPurchaseEntryModal) in a mutation with optimistic
 * cache updates: the purchased policy appears in the policies list
 * immediately, and rolls back if the transaction fails.
 */
export function usePurchasePolicyMutation() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, PurchasePolicyVariables, PurchaseSnapshot>({
    mutationFn: (variables) => variables.purchase(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.policies.all });

      const previousLists = queryClient.getQueriesData<PolicyListResponse>({
        queryKey: queryKeys.policies.all,
      });

      const optimisticPolicy = toOptimisticPolicy(variables.plan);
      queryClient.setQueriesData<PolicyListResponse>(
        { queryKey: queryKeys.policies.all },
        (current) =>
          current
            ? {
                ...current,
                policies: [optimisticPolicy, ...current.policies],
                totalCount: current.totalCount + 1,
              }
            : current
      );

      return { previousLists };
    },
    onError: (_error, _variables, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.policies.all });
    },
  });
}
