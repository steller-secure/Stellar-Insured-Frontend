/**
 * Policy API service module.
 * Typed methods for all policy-related backend communication.
 */

import apiClient, { type ApiResponse, type RequestConfig } from '@/lib/api-client';
import type { PaginatedResponse, PaginationParams, SortParams } from '@/lib/types/api.types';
import type {
  Policy,
  PolicyCreationRequest,
  PolicyUpdateRequest,
  PolicyFilterOptions,
  PremiumCalculationRequest,
  PremiumCalculationResult,
  PolicyStatus,
  PolicyType,
} from '@/services/types/policy.types';

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
    return apiClient.get<PaginatedResponse<Policy>>('/api/policies', {
      params: params as Record<string, string | number | boolean | undefined>,
      signal: controller.signal,
      retries: 1,
      ...config,
    });
  },

  /**
   * Fetch a single policy by ID.
   */
  async getById(
    id: string,
    config?: RequestConfig
  ): Promise<ApiResponse<Policy>> {
    const controller = apiClient.createCancelToken(CANCEL_KEYS.detail);
    return apiClient.get<Policy>(`/api/policies/${encodeURIComponent(id)}`, {
      signal: controller.signal,
      ...config,
    });
  },

  /**
   * Create a new policy.
   */
  async create(
    data: PolicyCreationRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<Policy>> {
    return apiClient.post<Policy>('/api/policies', data, config);
  },

  /**
   * Update an existing policy.
   */
  async update(
    id: string,
    data: PolicyUpdateRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<Policy>> {
    return apiClient.put<Policy>(
      `/api/policies/${encodeURIComponent(id)}`,
      data,
      config
    );
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
    return apiClient.post<PremiumCalculationResult>(
      '/api/policies/premium',
      data,
      { signal: controller.signal, ...config }
    );
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
    return apiClient.get('/api/policies/statistics', { retries: 1, ...config });
  },

  /**
   * Cancel any in-flight policy requests.
   */
  cancelAll(): void {
    Object.values(CANCEL_KEYS).forEach((key) => apiClient.cancelRequest(key));
  },
};

export default policyApi;
