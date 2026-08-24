import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test-utils/renderWithQueryClient';
import { usePoliciesQuery, usePolicyQuery, usePolicyStatsQuery } from '../usePolicies';
import { policyService } from '@/services/policyService';

jest.mock('@/services/policyService', () => ({
  policyService: {
    getPolicies: jest.fn(),
    getPolicyById: jest.fn(),
    getPolicyStatistics: jest.fn(),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

const mockPolicy = {
  id: 'p1',
  name: 'Crypto Protection',
  type: 'Home' as const,
  status: 'active' as const,
  coverageLimit: 50000,
  coverageLimitFormatted: '$50,000',
  policyNumber: 'POL-001',
};

describe('usePoliciesQuery', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns the policy list on success', async () => {
    (policyService.getPolicies as jest.Mock).mockResolvedValue({
      success: true,
      data: { policies: [mockPolicy], totalCount: 1, currentPage: 1, totalPages: 1 },
    });

    const { result } = renderHook(() => usePoliciesQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.policies).toEqual([mockPolicy]);
  });

  it('surfaces a service-level failure as a query error', async () => {
    (policyService.getPolicies as jest.Mock).mockResolvedValue({
      success: false,
      data: { policies: [], totalCount: 0, currentPage: 1, totalPages: 1 },
      error: 'Failed to retrieve policies',
    });

    const { result } = renderHook(() => usePoliciesQuery(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Failed to retrieve policies');
  });
});

describe('usePolicyQuery', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches a single policy by id', async () => {
    (policyService.getPolicyById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockPolicy,
    });

    const { result } = renderHook(() => usePolicyQuery('p1'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPolicy);
    expect(policyService.getPolicyById).toHaveBeenCalledWith('p1');
  });

  it('does not fetch when no id is provided', () => {
    renderHook(() => usePolicyQuery(undefined), { wrapper });
    expect(policyService.getPolicyById).not.toHaveBeenCalled();
  });
});

describe('usePolicyStatsQuery', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns aggregate statistics', async () => {
    (policyService.getPolicyStatistics as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        totalPolicies: 3,
        activePolicies: 2,
        pendingPolicies: 1,
        expiredPolicies: 0,
        totalCoverage: 150000,
        averagePremium: 42,
      },
    });

    const { result } = renderHook(() => usePolicyStatsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.totalPolicies).toBe(3);
  });
});
