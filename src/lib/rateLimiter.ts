import { apiConfig } from '../config/api';

interface QueuedRequest {
  fn: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

class TokenBucketRateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per ms
  private lastRefill: number;
  private queue: QueuedRequest[];
  private processing: boolean;

  constructor(requestsPerSecond: number, maxBurst: number) {
    this.maxTokens = maxBurst;
    this.tokens = maxBurst;
    this.refillRate = requestsPerSecond / 1000;
    this.lastRefill = Date.now();
    this.queue = [];
    this.processing = false;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const newTokens = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      this.refill();

      if (this.tokens >= 1) {
        this.tokens -= 1;
        const request = this.queue.shift()!;
        try {
          const result = await request.fn();
          request.resolve(result);
        } catch (err) {
          request.reject(err);
        }
      } else {
        // Wait until next token is available
        const waitMs = (1 - this.tokens) / this.refillRate;
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }

    this.processing = false;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        fn: fn as () => Promise<unknown>,
        resolve: resolve as (v: unknown) => void,
        reject,
      });
      this.processQueue();
    });
  }

  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.queue = [];
    this.processing = false;
  }
}

// Singleton — uses settings from existing apiConfig
export const rateLimiter = new TokenBucketRateLimiter(
  apiConfig.requestsPerSecond,
  apiConfig.maxBurst
);