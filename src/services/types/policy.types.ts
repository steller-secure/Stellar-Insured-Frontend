/**
 * Policy service type definitions.
 *
 * Domain types (`Policy`, `PolicyStatus`, `PolicyType`, request/result shapes)
 * are re-exported from the canonical Zod-derived types in `@/types/api`, so this
 * module adds no duplicate declarations — it is a thin surface over the single
 * source of truth. The remaining declarations are service-specific shapes that
 * have no `@/types/api` equivalent.
 */
import type { Policy, PolicyStatus, PolicyType } from '@/types/api';

export type {
  Policy,
  PolicyStatus,
  PolicyType,
  PolicyCreationRequest,
  PolicyUpdateRequest,
  PremiumCalculationRequest,
  PremiumCalculationResult,
  PolicyStats,
} from '@/types/api';

// ─── Claim incident vocabulary (service-specific) ───────────────────────────

export type IncidentType =
  | 'wallet-hack'
  | 'smart-contract'
  | 'defi-protocol'
  | 'exchange-hack'
  | 'phishing'
  | 'other';

// ─── Service-only shapes (no @/types/api equivalent) ────────────────────────

export interface PolicyValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PolicyFilterOptions {
  status?: PolicyStatus;
  type?: PolicyType;
  searchQuery?: string;
  sortBy?: 'name' | 'coverageLimit' | 'expiryDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PolicyServiceResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Service list envelope. Intentionally distinct from the `@/types/api`
 * paginated envelope (`items`/`page`/`pageSize`): this shape uses
 * `policies`/`currentPage` and is consumed only by the policy service layer.
 */
export interface PolicyListResponse {
  policies: Policy[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Aggregate statistics returned by `PolicyService.getPolicyStatistics`.
 * A superset of the canonical `PolicyStats` with service-only status breakdowns.
 */
export interface PolicyStatistics {
  totalPolicies: number;
  activePolicies: number;
  pendingPolicies: number;
  expiredPolicies: number;
  totalCoverage: number;
  averagePremium: number;
}
