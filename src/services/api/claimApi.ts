/**
 * Claim API service module.
 * Typed methods for all claim-related backend communication.
 */

import apiClient, { type ApiResponse, type RequestConfig } from '@/lib/api-client';
import type { PaginatedResponse, PaginationParams, SortParams } from '@/lib/types/api.types';

// ─── Claim types ─────────────────────────────────────────────────────────────

export type ClaimStatus = 'Active' | 'Pending' | 'Approved' | 'Rejected';

export interface Claim {
  id: string;
  policyId: string;
  policyName: string;
  incidentType: string;
  amount: number;
  amountFormatted: string;
  dateFiled: string;
  status: ClaimStatus;
  description: string;
  evidence?: string[];
  walletAddress?: string;
}

export interface ClaimCreationRequest {
  policyId: string;
  incidentType: string;
  amount: number;
  description: string;
  evidence?: string[];
  walletAddress?: string;
}

export interface ClaimUpdateRequest {
  status?: ClaimStatus;
  description?: string;
  evidence?: string[];
}

export interface ClaimListParams extends PaginationParams, SortParams {
  status?: ClaimStatus;
  policyId?: string;
  search?: string;
}

// ─── Cancellation keys ──────────────────────────────────────────────────────

const CANCEL_KEYS = {
  list: 'claim-list',
  detail: 'claim-detail',
} as const;

// ─── API Methods ─────────────────────────────────────────────────────────────

export const claimApi = {
  /**
   * Fetch a paginated list of claims.
   */
  async list(
    params?: ClaimListParams,
    config?: RequestConfig
  ): Promise<ApiResponse<PaginatedResponse<Claim>>> {
    const controller = apiClient.createCancelToken(CANCEL_KEYS.list);
    return apiClient.get<PaginatedResponse<Claim>>('/api/claims', {
      params: params as Record<string, string | number | boolean | undefined>,
      signal: controller.signal,
      retries: 1,
      ...config,
    });
  },

  /**
   * Fetch a single claim by ID.
   */
  async getById(
    id: string,
    config?: RequestConfig
  ): Promise<ApiResponse<Claim>> {
    const controller = apiClient.createCancelToken(CANCEL_KEYS.detail);
    return apiClient.get<Claim>(`/api/claims/${encodeURIComponent(id)}`, {
      signal: controller.signal,
      ...config,
    });
  },

  /**
   * Submit a new claim.
   */
  async create(
    data: ClaimCreationRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<Claim>> {
    return apiClient.post<Claim>('/api/claims', data, config);
  },

  /**
   * Update an existing claim (e.g. add evidence, change status).
   */
  async update(
    id: string,
    data: ClaimUpdateRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<Claim>> {
    return apiClient.patch<Claim>(
      `/api/claims/${encodeURIComponent(id)}`,
      data,
      config
    );
  },

  /**
   * Delete / withdraw a claim.
   */
  async remove(
    id: string,
    config?: RequestConfig
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `/api/claims/${encodeURIComponent(id)}`,
      config
    );
  },

  /**
   * Fetch claim statistics for the current user.
   */
  async getStatistics(
    config?: RequestConfig
  ): Promise<
    ApiResponse<{
      totalClaims: number;
      pendingClaims: number;
      approvedClaims: number;
      totalClaimedAmount: number;
    }>
  > {
    return apiClient.get('/api/claims/statistics', { retries: 1, ...config });
  },

  /**
   * Cancel any in-flight claim requests.
   */
  cancelAll(): void {
    Object.values(CANCEL_KEYS).forEach((key) => apiClient.cancelRequest(key));
  },
};

export default claimApi;
