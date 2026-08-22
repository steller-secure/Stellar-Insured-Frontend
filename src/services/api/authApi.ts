/**
 * Auth API service module.
 * Typed methods for authentication-related backend communication.
 */

import apiClient, { type ApiResponse, type RequestConfig } from '@/lib/api-client';
import {
  authRequestSchema,
  authResponseSchema,
  authSessionSchema,
  type AuthRequest,
  type AuthResponse,
  type AuthSession,
} from '@/types/api';

// ─── API Methods ─────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Authenticate a wallet address with a signed message.
   */
  async authenticate(
    data: AuthRequest,
    config?: RequestConfig
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<unknown>('/api/auth/authenticate', data, config);
    return {
      ...response,
      data: authResponseSchema.parse(response.data),
    };
  },

  /**
   * Verify an existing session token.
   */
  async verifySession(
    config?: RequestConfig
  ): Promise<ApiResponse<AuthSession>> {
    const response = await apiClient.get<unknown>('/api/auth/session', config);
    return {
      ...response,
      data: authSessionSchema.parse(response.data),
    };
  },

  /**
   * Refresh an expired session token.
   */
  async refreshSession(
    refreshToken: string,
    config?: RequestConfig
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<unknown>(
      '/api/auth/refresh',
      { refreshToken },
      config
    );
    return {
      ...response,
      data: authResponseSchema.parse(response.data),
    };
  },

  /**
   * Sign out / invalidate the current session.
   */
  async signOut(
    config?: RequestConfig
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/api/auth/signout', undefined, config);
  },
};

export default authApi;