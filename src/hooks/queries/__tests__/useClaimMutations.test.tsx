import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test-utils/renderWithQueryClient';
import { useCreateClaimMutation } from '../useClaimMutations';
import { queryKeys } from '../queryKeys';
import { claimApi } from '@/services/api/claimApi';
import type { Claim } from '@/types/api';

jest.mock('@/services/api/claimApi', () => ({
  claimApi: {
    create: jest.fn(),
  },
}));

function renderWithClient(client: QueryClient) {
  return renderHook(() => useCreateClaimMutation(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}

const request = {
  policyId: 'p1',
  incidentType: 'wallet-hack',
  amount: 500,
  description: 'Unauthorized wallet access resulted in loss of funds.',
};

describe('useCreateClaimMutation', () => {
  beforeEach(() => jest.clearAllMocks());

  it('optimistically inserts the claim into the cached claims list', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData<Claim[]>(queryKeys.claims.list, []);
    (claimApi.create as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { id: 'CLM-9' } }), 10))
    );

    const { result } = renderWithClient(queryClient);

    act(() => {
      result.current.mutate({ request, policyName: 'Crypto Protection' });
    });

    await waitFor(() => {
      const data = queryClient.getQueryData<Claim[]>(queryKeys.claims.list);
      expect(data).toHaveLength(1);
    });
    expect(queryClient.getQueryData<Claim[]>(queryKeys.claims.list)?.[0].policyName).toBe(
      'Crypto Protection'
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe('CLM-9');
  });

  it('rolls back the optimistic claim if submission fails', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData<Claim[]>(queryKeys.claims.list, []);
    (claimApi.create as jest.Mock).mockRejectedValue(new Error('validation failed'));

    const { result } = renderWithClient(queryClient);

    act(() => {
      result.current.mutate({ request, policyName: 'Crypto Protection' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData<Claim[]>(queryKeys.claims.list)).toHaveLength(0);
  });
});
