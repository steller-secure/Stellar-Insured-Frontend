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
export type { ClaimListParams } from './claimApi';
export type { ProposalListParams, CastVoteRequest, CreateProposalRequest } from './daoApi';

export type {
  Policy,
  PolicyCreationRequest,
  PolicyUpdateRequest,
  PolicyStatus,
  PolicyType,
  Claim,
  ClaimCreationRequest,
  ClaimUpdateRequest,
  ClaimStatus,
  Proposal,
  ProposalStatus,
  VoteType,
} from '@/types/api';
