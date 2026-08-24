import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from '@/test-utils/renderWithQueryClient';
import { useClaimsQuery } from '../useClaims';
import { DataService } from '@/config/dataSource';

jest.mock('@/config/dataSource', () => ({
  DataService: {
    getClaims: jest.fn(),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

const mockClaim = {
  id: 'CLM-1',
  policyId: 'p1',
  policyName: 'Crypto Protection',
  incidentType: 'wallet-hack',
  amount: 500,
  amountFormatted: '$500',
  dateFiled: '2026-01-01',
  status: 'Pending' as const,
  description: 'Test claim',
};

describe('useClaimsQuery', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns claims from DataService', async () => {
    (DataService.getClaims as jest.Mock).mockResolvedValue([mockClaim]);

    const { result } = renderHook(() => useClaimsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([mockClaim]);
  });

  it('surfaces a rejected fetch as a query error', async () => {
    (DataService.getClaims as jest.Mock).mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useClaimsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('network down');
  });
});
