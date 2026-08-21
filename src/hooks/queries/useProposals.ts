'use client';

import { useQuery } from '@tanstack/react-query';
import { proposalService } from '@/services/proposalService';
import type { Proposal, ProposalStatus } from '@/types/api';
import { queryKeys } from './queryKeys';

interface UseProposalsQueryOptions {
  filter?: ProposalStatus;
  /** Seed the cache with server-rendered proposals to avoid a first-paint flash. */
  initialData?: Proposal[];
}

/** Fetch governance proposals. Wraps the same proposalService.listProposals() call every consumer already used. */
export function useProposalsQuery(options: UseProposalsQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.proposals.list(options.filter),
    queryFn: () => proposalService.listProposals(options.filter),
    initialData: options.initialData,
  });
}
