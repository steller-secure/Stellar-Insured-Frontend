/**
 * Centralized API client for backend communication.
 * Provides request/response interceptors, auth token management,
 * retry logic with exponential backoff, and request cancellation.
 */

import { errorHandler, type ErrorCategory } from '@/lib/errorHandler';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export interface RequestConfig extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  retries?: number;
  body?: unknown;
}

type RequestInterceptor = (
  url: string,
  config: RequestInit
) => [string, RequestInit] | Promise<[string, RequestInit]>;

type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

type ErrorInterceptor = (error: ApiClientError) => ApiClientError;

export interface ApiClientConfig {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// ─── Custom Error ────────────────────────────────────────────────────────────

export class ApiClientError extends Error {
  status: number;
  code: string;
  details: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code ?? 'UNKNOWN_ERROR';
    this.details = details;
  }
}

// ─── API Client Class ────────────────────────────────────────────────────────

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;
  private defaultRetries: number;

  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  // Track active AbortControllers for cancellation
  private activeControllers = new Map<string, AbortController>();

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/+$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config.defaultHeaders,
    };
    this.defaultTimeout = config.timeout ?? 30_000;
    this.defaultRetries = config.retries ?? 0;
  }

  // ─── Interceptor Registration ────────────────────────────────────────────

  onRequest(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter(
        (i) => i !== interceptor
      );
    };
  }

  onResponse(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter(
        (i) => i !== interceptor
      );
    };
  }

  onError(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      this.errorInterceptors = this.errorInterceptors.filter(
        (i) => i !== interceptor
      );
    };
  }

  // ─── Request Cancellation ────────────────────────────────────────────────

  /**
   * Create a cancellable request. Returns an AbortController
   * that the caller can use to cancel the in-flight request.
   */
  createCancelToken(key: string): AbortController {
    // Cancel any previous request with the same key
    this.cancelRequest(key);

    const controller = new AbortController();
    this.activeControllers.set(key, controller);
    return controller;
  }

  cancelRequest(key: string): void {
    const controller = this.activeControllers.get(key);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(key);
    }
  }

  cancelAll(): void {
    this.activeControllers.forEach((controller) => controller.abort());
    this.activeControllers.clear();
  }

  // ─── HTTP Methods ────────────────────────────────────────────────────────

  async get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  async post<T>(
    path: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'POST', body: data });
  }

  async put<T>(
    path: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'PUT', body: data });
  }

  async patch<T>(
    path: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'PATCH', body: data });
  }

  async delete<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }

  // ─── Core Request Logic ──────────────────────────────────────────────────

  private async request<T>(
    path: string,
    config: RequestConfig & { method: string }
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(path, config.params);
    const retries = config.retries ?? this.defaultRetries;
    const timeout = config.timeout ?? this.defaultTimeout;

    const { params: _params, timeout: _timeout, retries: _retries, body, ...fetchOptions } = config;

    // Build RequestInit
    let init: RequestInit = {
      ...fetchOptions,
      headers: {
        ...this.defaultHeaders,
        ...(config.headers as Record<string, string>),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    };

    // Run request interceptors
    let finalUrl = url;
    for (const interceptor of this.requestInterceptors) {
      [finalUrl, init] = await interceptor(finalUrl, init);
    }

    // Execute with retry logic
    const execute = async (): Promise<ApiResponse<T>> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Merge signals: if caller provided one via cancelToken, combine them
      const existingSignal = init.signal;
      if (existingSignal) {
        existingSignal.addEventListener('abort', () => controller.abort());
      }

      try {
        let response = await fetch(finalUrl, {
          ...init,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Run response interceptors
        for (const interceptor of this.responseInterceptors) {
          response = await interceptor(response);
        }

        if (!response.ok) {
          const errorBody = await this.safeParseJSON(response);
          throw new ApiClientError(
            (errorBody?.message as string) ?? response.statusText,
            response.status,
            errorBody?.code as string | undefined,
            errorBody
          );
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return {
            data: undefined as T,
            status: response.status,
            headers: response.headers,
          };
        }

        const data = await response.json() as T;
        return { data, status: response.status, headers: response.headers };
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiClientError) {
          let processed = error;
          for (const interceptor of this.errorInterceptors) {
            processed = interceptor(processed);
          }
          throw processed;
        }

        // Network errors or aborts
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new ApiClientError('Request was cancelled or timed out', 0, 'ABORT');
        }

        throw new ApiClientError(
          error instanceof Error ? error.message : 'Network error',
          0,
          'NETWORK_ERROR'
        );
      }
    };

    // Retry with exponential backoff via errorHandler
    if (retries > 0) {
      return errorHandler.retryWithBackoff<ApiResponse<T>>(
        execute,
        'NETWORK' as ErrorCategory,
        {
          maxRetries: retries,
          baseDelay: 1000,
          maxDelay: 8000,
          exponentialFactor: 2,
          jitter: true,
        }
      );
    }

    return execute();
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private buildURL(
    path: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const url = new URL(`${this.baseURL}${path.startsWith('/') ? '' : '/'}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async safeParseJSON(response: Response): Promise<Record<string, unknown> | null> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
}

// ─── Default Instance ────────────────────────────────────────────────────────

const BASE_URL =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'
    : 'http://localhost:4000';

export const apiClient = new ApiClient({
  baseURL: BASE_URL,
  timeout: 30_000,
  retries: 0,
});

// ─── Auth Token Interceptor ──────────────────────────────────────────────────

apiClient.onRequest(async (url, config) => {
  // Read the auth token from the wallet store persisted in localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('wallet-store');
      if (raw) {
        const store = JSON.parse(raw);
        const token = store?.state?.session?.token;
        if (token) {
          const headers = new Headers(config.headers);
          headers.set('Authorization', `Bearer ${token}`);
          return [url, { ...config, headers }];
        }
      }
    } catch {
      // Ignore parse errors — proceed without auth header
    }
  }
  return [url, config];
});

// ─── Error Categorization Interceptor ────────────────────────────────────────

apiClient.onError((error) => {
  const category: ErrorCategory =
    error.status === 401 || error.status === 403
      ? 'AUTHENTICATION'
      : error.status >= 400 && error.status < 500
        ? 'VALIDATION'
        : error.status >= 500
          ? 'NETWORK'
          : 'NETWORK';

  const codeMap: Record<number, string> = {
    401: 'UNAUTHORIZED',
    403: 'UNAUTHORIZED',
    404: 'NOT_FOUND',
    422: 'INVALID_INPUT',
    429: 'RATE_LIMITED',
    500: 'SERVER_ERROR',
    502: 'SERVER_ERROR',
    503: 'SERVER_ERROR',
  };

  errorHandler.handleError(
    category,
    codeMap[error.status] ?? 'GENERIC_ERROR',
    error,
    { url: error.message, status: error.status }
  );

  return error;
});

export default apiClient;
