'use client';

import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/config/dataSource';
import type { Proposal, ProposalStatus } from '@/types/api';
import { queryKeys } from './queryKeys';

interface UseProposalsQueryOptions {
  filter?: ProposalStatus;
  /** Seed the cache with server-rendered proposals to avoid a first-paint flash. */
  initialData?: Proposal[];
}

/**
 * Fetch governance proposals. Wraps the same DataService.getProposals() call
 * the DAO voting page already uses for its server-rendered initialProposals —
 * proposalService is a separate, local-only store backing the "create
 * proposal" form and isn't the list's source of truth.
 */
export function useProposalsQuery(options: UseProposalsQueryOptions = {}) {
  return useQuery({
    queryKey: queryKeys.proposals.list(options.filter),
    queryFn: async () => {
      const proposals = await DataService.getProposals();
      return options.filter ? proposals.filter((p) => p.status === options.filter) : proposals;
    },
    initialData: options.initialData,
  });
}
