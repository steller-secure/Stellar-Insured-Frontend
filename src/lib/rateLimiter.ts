// src/lib/rateLimiter.ts
import { apiConfig } from '../config/api';

interface QueuedRequest<T = unknown> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

export class TokenBucketRateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private lastRefill: number;
  private queue: Array<QueuedRequest<any>> = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(requestsPerSecond: number, maxBurst: number) {
    this.maxTokens = maxBurst;
    this.tokens = maxBurst;
    this.refillRate = requestsPerSecond / 1000; // tokens per millisecond
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = Math.max(0, now - this.lastRefill);
    if (elapsed <= 0) {
      return;
    }

    const newTokens = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }

  private scheduleNext(): void {
    if (this.timer || this.queue.length === 0) {
      return;
    }

    const now = Date.now();
    const waitForCooldown = Math.max(0, this.lastRefill - now);
    const tokensNeeded = Math.max(0, 1 - this.tokens);
    const waitForToken = this.refillRate > 0
      ? Math.ceil(tokensNeeded / this.refillRate)
      : 1000;
    const delay = Math.max(1, waitForCooldown, waitForToken);

    this.timer = setTimeout(() => {
      this.timer = null;
      void this.processQueue();
    }, delay);
  }

  private async processQueue(): Promise<void> {
    this.timer = null;
    this.refill();

    while (this.queue.length > 0 && this.tokens >= 1) {
      this.tokens -= 1;
      const request = this.queue.shift()!;
      try {
        const result = await request.fn();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
      this.refill();
    }

    if (this.queue.length > 0) {
      this.scheduleNext();
    }
  }

  private drainQueue(error: Error): void {
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      request.reject(error);
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.refill();

    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = { fn, resolve, reject };

      if (this.tokens >= 1 && this.queue.length === 0) {
        this.tokens -= 1;
        void (async () => {
          try {
            resolve(await fn());
          } catch (error) {
            reject(error);
          }
        })();
        return;
      }

      this.queue.push(request as QueuedRequest<any>);
      this.scheduleNext();
    });
  }

  acquire(): Promise<void> {
    return this.execute(async () => undefined);
  }

  reset(cooldownMs = 0): void {
    if (cooldownMs > 0) {
      this.tokens = 0;
      this.lastRefill = Date.now() + cooldownMs;
      this.scheduleNext();
      return;
    }

    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    this.drainQueue(new Error('Rate limiter reset'));
  }
}

export const rateLimiter = new TokenBucketRateLimiter(
  apiConfig.rateLimit.requestsPerSecond,
  apiConfig.rateLimit.maxBurst,
);