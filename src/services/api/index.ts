/**
 * API service barrel export.
 * Import individual services from here for clean, centralized access.
 *
 * @example
 *   import { policyApi, claimApi, daoApi } from '@/services/api';
 */

export { policyApi } from './policyApi';
export { claimApi } from './claimApi';
export { daoApi } from './daoApi';

// Re-export useful types
export type { PolicyListParams } from './policyApi';
export type {
  Claim,
  ClaimCreationRequest,
  ClaimUpdateRequest,
  ClaimListParams,
  ClaimStatus,
} from './claimApi';
export type {
  ProposalListParams,
  ProposalStatus,
  CastVoteRequest,
  CreateProposalRequest,
} from './daoApi';
