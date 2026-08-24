/**
 * Central query key registry.
 *
 * Every useQuery/useMutation cache read or write goes through these
 * factories so key shapes never get hand-typed (and drift) in more than
 * one place.
 */

import type { PolicyFilterOptions } from '@/services/types/policy.types';
import type { ProposalStatus } from '@/types/api';

export const queryKeys = {
  policies: {
    all: ['policies'] as const,
    list: (options?: PolicyFilterOptions) => ['policies', 'list', options ?? null] as const,
    detail: (id: string) => ['policies', 'detail', id] as const,
    stats: ['policies', 'stats'] as const,
  },
  claims: {
    all: ['claims'] as const,
    list: ['claims', 'list'] as const,
    detail: (id: string) => ['claims', 'detail', id] as const,
    stats: ['claims', 'stats'] as const,
  },
  proposals: {
    all: ['proposals'] as const,
    list: (filter?: ProposalStatus) => ['proposals', 'list', filter ?? null] as const,
  },
  wallet: {
    all: ['wallet'] as const,
    balance: (address: string | null) => ['wallet', 'balance', address] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    summary: ['analytics', 'summary'] as const,
  },
} as const;
