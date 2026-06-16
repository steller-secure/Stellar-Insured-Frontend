/**
 * Claim API service module.
 * Typed methods for all claim-related backend communication.
 */

import apiClient, { type ApiResponse, type RequestConfig } from '@/lib/api-client';
import type { PaginatedResponse, PaginationParams, SortParams } from '@/lib/types/api.types';
import {
  paginatedClaimSchema,
  claimSchema,
  claimStatsSchema,
  type Claim,
  type ClaimCreationRequest,
  type ClaimUpdateRequest,
  type ClaimStatus,
} from '@/types/api';

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
    const response = await apiClient.get<unknown>('/api/claims', {
      params: params as Record<string, string | number | boolean | undefined>,
      signal: controller.signal,
      retries: 1,
      ...config,
    });
    return {
      ...response,
      data: paginatedClaimSchema.parse(response.data),
    };
  },

  /**
   * Fetch a single claim by ID.
   */
  async getById(
    id: string,
    config?: RequestConfig
  ): Promise<ApiResponse<Claim>> {
    const controller = apiClient.createCancelToken(CANCEL_KEYS.detail);
    const response = await apiClient.get<unknown>(`/api/claims/${encodeURIComponent(id)}`, {
      signal: controller.signal,
      ...config,
    });
    return {
      ...response,
      data: claimSchema.parse(response.data),
    };
  },

  /**
   * Submit a new claim.
   */
  async create(
    data: ClaimCreationRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<Claim>> {
    const response = await apiClient.post<unknown>('/api/claims', data, config);
    return {
      ...response,
      data: claimSchema.parse(response.data),
    };
  },

  /**
   * Update an existing claim (e.g. add evidence, change status).
   */
  async update(
    id: string,
    data: ClaimUpdateRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<Claim>> {
    const response = await apiClient.patch<unknown>(
      `/api/claims/${encodeURIComponent(id)}`,
      data,
      config
    );
    return {
      ...response,
      data: claimSchema.parse(response.data),
    };
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
    const response = await apiClient.get<unknown>('/api/claims/statistics', { retries: 1, ...config });
    return {
      ...response,
      data: claimStatsSchema.parse(response.data),
    };
  },

  /**
   * Cancel any in-flight claim requests.
   */
  cancelAll(): void {
    Object.values(CANCEL_KEYS).forEach((key) => apiClient.cancelRequest(key));
  },
};

export default claimApi;
