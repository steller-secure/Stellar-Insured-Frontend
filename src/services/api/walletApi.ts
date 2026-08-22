/**
 * Wallet API service module.
 * Typed methods for wallet balance and related backend communication.
 */

import apiClient, { type ApiResponse, type RequestConfig } from '@/lib/api-client';
import {
  walletBalanceResponseSchema,
  type WalletBalanceResponse,
} from '@/types/api';

// ─── API Methods ─────────────────────────────────────────────────────────────

export const walletApi = {
  /**
   * Fetch the wallet balance for a given address.
   */
  async getBalance(
    address: string,
    config?: RequestConfig
  ): Promise<ApiResponse<WalletBalanceResponse>> {
    const response = await apiClient.get<unknown>(
      `/api/wallet/${encodeURIComponent(address)}/balance`,
      { retries: 1, ...config }
    );
    return {
      ...response,
      data: walletBalanceResponseSchema.parse(response.data),
    };
  },

  /**
   * Fetch the wallet balance for the currently authenticated user.
   */
  async getMyBalance(
    config?: RequestConfig
  ): Promise<ApiResponse<WalletBalanceResponse>> {
    const response = await apiClient.get<unknown>(
      '/api/wallet/balance',
      { retries: 1, ...config }
    );
    return {
      ...response,
      data: walletBalanceResponseSchema.parse(response.data),
    };
  },
};

export default walletApi;