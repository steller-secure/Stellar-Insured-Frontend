import { rateLimiter } from './rateLimiter';

describe('Rate Limiter', () => {
  beforeEach(() => {
    rateLimiter.reset();
  });
  it('should process requests within limits', async () => {
    const start = Date.now();
    await rateLimiter.execute(() => Promise.resolve(true));
    expect(Date.now() - start).toBeLessThan(50);
  });

  it('should queue requests when burst is exceeded', async () => {
    const tasks = Array(12).fill(0).map(() => rateLimiter.execute(() => Promise.resolve(true)));
    const start = Date.now();
    await Promise.all(tasks);
    const duration = Date.now() - start;
    // Since 5 req/sec, 12 requests should take at least 400ms+
    expect(duration).toBeGreaterThan(200);
  });

  it('should allow acquire to wait for a rate limit token', async () => {
    const acquirePromise = rateLimiter.acquire();
    const executePromise = rateLimiter.execute(() => Promise.resolve('ok'));

    const [acquireResult, executeResult] = await Promise.all([
      acquirePromise,
      executePromise,
    ]);

    expect(acquireResult).toBeUndefined();
    expect(executeResult).toBe('ok');
  });
});