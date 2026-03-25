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
}

export const apiConfig: ApiConfig = {
  baseUrl: getEnv('NEXT_PUBLIC_API_BASE_URL'),
  timeout: 30_000,
  retries: 0,
  walletStoreKey: 'wallet-store',
};
