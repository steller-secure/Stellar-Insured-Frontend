/**
 * Simple client-side rate limiter using a token bucket algorithm.
 * Helps prevent overwhelming the API and hitting server-side rate limits.
 */

import { apiConfig } from "@/config/api";

export interface RateLimiterConfig {
  requestsPerSecond: number;
  maxBurst?: number;
}

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private requestsPerSecond: number;
  private maxBurst: number;
  private queue: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
  }> = [];

  constructor(config: RateLimiterConfig) {
    this.requestsPerSecond = config.requestsPerSecond;
    this.maxBurst = config.maxBurst ?? config.requestsPerSecond;
    this.tokens = this.maxBurst;
    this.lastRefill = Date.now();
  }

  /**
   * Acquires a token to perform a request.
   * Returns a promise that resolves when the request can proceed.
   */
  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    // No tokens available, queue the request
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
      this.scheduleProcessing();
    });
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const refillAmount = elapsed * (this.requestsPerSecond / 1000);

    if (refillAmount > 0) {
      this.tokens = Math.min(this.maxBurst, this.tokens + refillAmount);
      this.lastRefill = now;
    }
  }

  private scheduleProcessing(): void {
    const now = Date.now();
    this.refill();

    if (this.tokens >= 1 && this.queue.length > 0) {
      const { resolve } = this.queue.shift()!;
      this.tokens -= 1;
      resolve();
      
      if (this.queue.length > 0) {
        this.scheduleProcessing();
      }
      return;
    }

    if (this.queue.length > 0) {
      // Calculate delay until next token is available
      const needed = 1 - this.tokens;
      const delay = Math.ceil((needed * 1000) / this.requestsPerSecond);
      setTimeout(() => this.scheduleProcessing(), delay);
    }
  }

  /**
   * Resets the rate limiter (e.g. after a 429 response)
   */
  reset(cooldownMs: number = 0): void {
    this.tokens = 0;
    this.lastRefill = Date.now() + cooldownMs;
  }
}


// Default rate limiter instance
export const globalRateLimiter = new RateLimiter({
  requestsPerSecond: apiConfig.rateLimit.requestsPerSecond,
  maxBurst: apiConfig.rateLimit.maxBurst,
});
