'use client';

import { useQuery } from '@tanstack/react-query';
import { DataService } from '@/config/dataSource';
import { queryKeys } from './queryKeys';

/** Fetch the current user's claims. Wraps the same DataService.getClaims() call every consumer already used. */
export function useClaimsQuery() {
  return useQuery({
    queryKey: queryKeys.claims.list,
    queryFn: () => DataService.getClaims(),
  });
}
