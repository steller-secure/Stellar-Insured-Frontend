/**
 * Analytics API service module.
 * Typed methods for analytics event tracking and retrieval.
 */

import { z } from 'zod';
import apiClient, { type ApiResponse, type RequestConfig } from '@/lib/api-client';
import {
  analyticsEventRequestSchema,
  analyticsEventSchema,
  analyticsStatsSchema,
  type AnalyticsEvent,
  type AnalyticsEventRequest,
  type AnalyticsStats,
} from '@/types/api';

// ─── API Methods ─────────────────────────────────────────────────────────────

export const analyticsApi = {
  /**
   * Track a new analytics event.
   */
  async trackEvent(
    data: AnalyticsEventRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<AnalyticsEvent>> {
    const response = await apiClient.post<unknown>('/api/analytics/events', data, config);
    return {
      ...response,
      data: analyticsEventSchema.parse(response.data),
    };
  },

  /**
   * Fetch analytics events with optional filtering.
   */
  async getEvents(
    params?: { category?: string; type?: string; limit?: number; offset?: number },
    config?: RequestConfig
  ): Promise<ApiResponse<AnalyticsEvent[]>> {
    const response = await apiClient.get<unknown>('/api/analytics/events', {
      params: params as Record<string, string | number | boolean | undefined>,
      retries: 1,
      ...config,
    });
    return {
      ...response,
      data: z.array(analyticsEventSchema).parse(response.data),
    };
  },

  /**
   * Fetch aggregate analytics statistics.
   */
  async getStatistics(
    config?: RequestConfig
  ): Promise<ApiResponse<AnalyticsStats>> {
    const response = await apiClient.get<unknown>('/api/analytics/statistics', { retries: 1, ...config });
    return {
      ...response,
      data: analyticsStatsSchema.parse(response.data),
    };
  },
};

export default analyticsApi;