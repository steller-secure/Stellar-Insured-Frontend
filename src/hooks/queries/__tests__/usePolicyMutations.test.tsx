import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test-utils/renderWithQueryClient';
import { usePurchasePolicyMutation } from '../usePolicyMutations';
import { queryKeys } from '../queryKeys';
import type { PolicyPlan } from '@/data/policies/listing/policy-plans-mock';
import type { PolicyListResponse } from '@/services/types/policy.types';

const mockPlan: PolicyPlan = {
  id: 'plan-1',
  categoryId: 'health',
  name: 'Health Shield',
  description: 'Comprehensive health coverage',
  coverage: '$50,000',
  premium: '$24/mo',
  duration: '12 months',
  deductible: '$500',
  premiumAmount: 24,
  premiumCurrency: 'USDC',
  billingCadence: 'monthly',
  assetCode: 'USDC',
  assetIssuer: 'ISSUER',
  networkFeeXlm: 0.15,
  policyNumber: 'POL-2026-001',
  startDate: 'Jan 1, 2026',
  endDate: 'Jan 1, 2027',
};

const emptyList: PolicyListResponse = {
  policies: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
};

function renderWithClient(client: QueryClient) {
  return renderHook(() => usePurchasePolicyMutation(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}

describe('usePurchasePolicyMutation', () => {
  it('optimistically inserts the purchased policy into cached policy lists', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.policies.list(undefined), emptyList);

    const { result } = renderWithClient(queryClient);

    act(() => {
      result.current.mutate({
        plan: mockPlan,
        purchase: () => new Promise((resolve) => setTimeout(() => resolve('tx-hash'), 10)),
      });
    });

    await waitFor(() => {
      const data = queryClient.getQueryData<PolicyListResponse>(
        queryKeys.policies.list(undefined)
      );
      expect(data?.policies).toHaveLength(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe('tx-hash');
  });

  it('rolls back the optimistic policy if the purchase fails', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.policies.list(undefined), emptyList);

    const { result } = renderWithClient(queryClient);

    act(() => {
      result.current.mutate({
        plan: mockPlan,
        purchase: () =>
          new Promise((_resolve, reject) =>
            setTimeout(() => reject(new Error('insufficient funds')), 10)
          ),
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const data = queryClient.getQueryData<PolicyListResponse>(
      queryKeys.policies.list(undefined)
    );
    expect(data?.policies).toHaveLength(0);
  });
});
