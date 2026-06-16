/**
 * DAO API service module.
 * Typed methods for governance proposals and voting.
 */

import apiClient, { type ApiResponse, type RequestConfig } from '@/lib/api-client';
import type { PaginatedResponse, PaginationParams, SortParams } from '@/lib/types/api.types';
import {
  paginatedProposalSchema,
  proposalSchema,
  castVoteResponseSchema,
  daoStatsSchema,
  type Proposal,
  type VoteType,
  type ProposalStatus,
} from '@/types/api';

// ─── Query types ─────────────────────────────────────────────────────────────

export interface ProposalListParams extends PaginationParams, SortParams {
  status?: ProposalStatus;
  search?: string;
}

export interface CastVoteRequest {
  proposalId: string;
  vote: VoteType;
}

export interface CreateProposalRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

// ─── Cancellation keys ──────────────────────────────────────────────────────

const CANCEL_KEYS = {
  list: 'dao-proposal-list',
  detail: 'dao-proposal-detail',
} as const;

// ─── API Methods ─────────────────────────────────────────────────────────────

export const daoApi = {
  /**
   * Fetch a paginated list of proposals.
   */
  async listProposals(
    params?: ProposalListParams,
    config?: RequestConfig
  ): Promise<ApiResponse<PaginatedResponse<Proposal>>> {
    const controller = apiClient.createCancelToken(CANCEL_KEYS.list);
    const response = await apiClient.get<unknown>('/api/dao/proposals', {
      params: params as Record<string, string | number | boolean | undefined>,
      signal: controller.signal,
      retries: 1,
      ...config,
    });
    return {
      ...response,
      data: paginatedProposalSchema.parse(response.data),
    };
  },

  /**
   * Fetch a single proposal by ID.
   */
  async getProposalById(
    id: string,
    config?: RequestConfig
  ): Promise<ApiResponse<Proposal>> {
    const controller = apiClient.createCancelToken(CANCEL_KEYS.detail);
    const response = await apiClient.get<unknown>(
      `/api/dao/proposals/${encodeURIComponent(id)}`,
      { signal: controller.signal, ...config }
    );
    return {
      ...response,
      data: proposalSchema.parse(response.data),
    };
  },

  /**
   * Create a new governance proposal.
   */
  async createProposal(
    data: CreateProposalRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<Proposal>> {
    const response = await apiClient.post<unknown>('/api/dao/proposals', data, config);
    return {
      ...response,
      data: proposalSchema.parse(response.data),
    };
  },

  /**
   * Cast a vote on a proposal.
   */
  async castVote(
    proposalId: string,
    vote: VoteType,
    config?: RequestConfig
  ): Promise<ApiResponse<{ success: boolean; updatedProposal: Proposal }>> {
    const response = await apiClient.post<unknown>(
      `/api/dao/proposals/${encodeURIComponent(proposalId)}/vote`,
      { vote },
      config
    );
    return {
      ...response,
      data: castVoteResponseSchema.parse(response.data),
    };
  },

  /**
   * Fetch governance statistics for the current user.
   */
  async getStatistics(
    config?: RequestConfig
  ): Promise<
    ApiResponse<{
      activeProposals: number;
      votedProposals: number;
      totalVotingPower: number;
    }>
  > {
    const response = await apiClient.get<unknown>('/api/dao/statistics', { retries: 1, ...config });
    return {
      ...response,
      data: daoStatsSchema.parse(response.data),
    };
  },

  /**
   * Cancel any in-flight DAO requests.
   */
  cancelAll(): void {
    Object.values(CANCEL_KEYS).forEach((key) => apiClient.cancelRequest(key));
  },
};

export default daoApi;
