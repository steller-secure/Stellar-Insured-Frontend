/**
 * API and HTTP client configuration constants.
 */

import { getEnv } from './env';

export interface ApiConfig {
  /** Backend REST API base URL. */
  baseUrl: string;
  /** Default request timeout in milliseconds. */
  timeout: number;
  /** Default number of automatic retries for failed requests. */
  retries: number;
  /** localStorage key where the persisted wallet store lives. */
  walletStoreKey: string;
  /** Client-side rate limiting configuration. */
  rateLimit: {
    requestsPerSecond: number;
    maxBurst: number;
  };
}

export const apiConfig: ApiConfig = {
  baseUrl: getEnv('NEXT_PUBLIC_API_BASE_URL'),
  timeout: 30_000,
  retries: 3, // Increased default retries to benefit from exponential backoff
  walletStoreKey: 'wallet-store',
  rateLimit: {
    requestsPerSecond: 5, // Conservative default
    maxBurst: 10,
  },
};
