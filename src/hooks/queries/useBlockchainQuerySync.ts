'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { blockchainEvents, type BlockchainEventType } from '@/lib/blockchainEvents';
import { queryKeys } from './queryKeys';

const INVALIDATION_TARGETS: Record<BlockchainEventType, readonly unknown[] | null> = {
  'policy.purchased': queryKeys.policies.all,
  'policy.updated': queryKeys.policies.all,
  'claim.submitted': queryKeys.claims.all,
  'claim.updated': queryKeys.claims.all,
  'proposal.updated': queryKeys.proposals.all,
  'vote.cast': queryKeys.proposals.all,
  'account.updated': queryKeys.wallet.all,
  unknown: null,
};

/**
 * Bridges the blockchainEvents pub/sub (WS/SSE/polling — see
 * lib/blockchainEvents.ts) to React Query cache invalidation. Mounted once
 * near the root so individual pages no longer need their own
 * blockchainEvents.subscribe() + manual refetch.
 */
export function useBlockchainQuerySync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    return blockchainEvents.subscribe((event) => {
      const queryKey = INVALIDATION_TARGETS[event.type];
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
    });
  }, [queryClient]);
}
