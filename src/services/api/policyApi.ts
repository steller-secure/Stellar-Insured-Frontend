/**
 * Policy API service module.
 * Typed methods for all policy-related backend communication.
 */

import apiClient, { type ApiResponse, type RequestConfig } from '@/lib/api-client';
import type { PaginatedResponse, PaginationParams, SortParams } from '@/lib/types/api.types';
import {
  paginatedPolicySchema,
  policySchema,
  premiumCalculationResultSchema,
  policyStatsSchema,
  type Policy,
  type PolicyCreationRequest,
  type PolicyUpdateRequest,
  type PremiumCalculationRequest,
  type PremiumCalculationResult,
  type PolicyStatus,
  type PolicyType,
} from '@/types/api';

// ─── Query types ─────────────────────────────────────────────────────────────

export interface PolicyListParams extends PaginationParams, SortParams {
  status?: PolicyStatus;
  type?: PolicyType;
  search?: string;
}

// ─── Cancellation keys ──────────────────────────────────────────────────────

const CANCEL_KEYS = {
  list: 'policy-list',
  detail: 'policy-detail',
  premium: 'policy-premium',
} as const;

// ─── API Methods ─────────────────────────────────────────────────────────────

export const policyApi = {
  /**
   * Fetch a paginated, filterable list of policies.
   */
  async list(
    params?: PolicyListParams,
    config?: RequestConfig
  ): Promise<ApiResponse<PaginatedResponse<Policy>>> {
    const controller = apiClient.createCancelToken(CANCEL_KEYS.list);
    const response = await apiClient.get<unknown>('/api/policies', {
      params: params as Record<string, string | number | boolean | undefined>,
      signal: controller.signal,
      retries: 1,
      ...config,
    });
    return {
      ...response,
      data: paginatedPolicySchema.parse(response.data),
    };
  },

  /**
   * Fetch a single policy by ID.
   */
  async getById(
    id: string,
    config?: RequestConfig
  ): Promise<ApiResponse<Policy>> {
    const controller = apiClient.createCancelToken(CANCEL_KEYS.detail);
    const response = await apiClient.get<unknown>(`/api/policies/${encodeURIComponent(id)}`, {
      signal: controller.signal,
      ...config,
    });
    return {
      ...response,
      data: policySchema.parse(response.data),
    };
  },

  /**
   * Create a new policy.
   */
  async create(
    data: PolicyCreationRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<Policy>> {
    const response = await apiClient.post<unknown>('/api/policies', data, config);
    return {
      ...response,
      data: policySchema.parse(response.data),
    };
  },

  /**
   * Update an existing policy.
   */
  async update(
    id: string,
    data: PolicyUpdateRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<Policy>> {
    const response = await apiClient.put<unknown>(
      `/api/policies/${encodeURIComponent(id)}`,
      data,
      config
    );
    return {
      ...response,
      data: policySchema.parse(response.data),
    };
  },

  /**
   * Delete a policy.
   */
  async remove(
    id: string,
    config?: RequestConfig
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `/api/policies/${encodeURIComponent(id)}`,
      config
    );
  },

  /**
   * Calculate premium for policy parameters.
   */
  async calculatePremium(
    data: PremiumCalculationRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<PremiumCalculationResult>> {
    const controller = apiClient.createCancelToken(CANCEL_KEYS.premium);
    const response = await apiClient.post<unknown>(
      '/api/policies/premium',
      data,
      { signal: controller.signal, ...config }
    );
    return {
      ...response,
      data: premiumCalculationResultSchema.parse(response.data),
    };
  },

  /**
   * Fetch aggregate policy statistics.
   */
  async getStatistics(
    config?: RequestConfig
  ): Promise<
    ApiResponse<{
      totalPolicies: number;
      activePolicies: number;
      totalCoverage: number;
      averagePremium: number;
    }>
  > {
    const response = await apiClient.get<unknown>('/api/policies/statistics', { retries: 1, ...config });
    return {
      ...response,
      data: policyStatsSchema.parse(response.data),
    };
  },

  /**
   * Cancel any in-flight policy requests.
   */
  cancelAll(): void {
    Object.values(CANCEL_KEYS).forEach((key) => apiClient.cancelRequest(key));
  },
};

export default policyApi;
