/**
 * Tests for the centralized API client.
 */

import { ApiClientError } from '@/lib/api-client';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockFetch(
  status: number,
  body: unknown = {},
  headers: Record<string, string> = {}
) {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: `Status ${status}`,
    headers: new Headers(headers),
    json: jest.fn().mockResolvedValue(body),
  });
}

// We re-import the module in each test so interceptors don't leak across tests.
function loadClient() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('@/lib/api-client');
  return mod.apiClient as typeof import('@/lib/api-client').apiClient;
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.resetModules();
  jest.restoreAllMocks();
  // Provide a mock localStorage
  const store: Record<string, string> = {};
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => store[key] ?? null),
      setItem: jest.fn((key: string, val: string) => {
        store[key] = val;
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
    },
    writable: true,
    configurable: true,
  });
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ApiClient', () => {
  describe('HTTP methods', () => {
    it('GET request sends correct method and returns data', async () => {
      const fetchMock = mockFetch(200, { id: 1, name: 'test' });
      globalThis.fetch = fetchMock;
      const client = loadClient();

      const result = await client.get<{ id: number; name: string }>('/items');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toContain('/items');
      expect(init.method).toBe('GET');
      expect(result.data).toEqual({ id: 1, name: 'test' });
      expect(result.status).toBe(200);
    });

    it('POST request sends body as JSON', async () => {
      const fetchMock = mockFetch(201, { id: 99 });
      globalThis.fetch = fetchMock;
      const client = loadClient();

      await client.post('/items', { name: 'new' });

      const [, init] = fetchMock.mock.calls[0];
      expect(init.method).toBe('POST');
      expect(init.body).toBe(JSON.stringify({ name: 'new' }));
    });

    it('PUT request sends body as JSON', async () => {
      const fetchMock = mockFetch(200, { updated: true });
      globalThis.fetch = fetchMock;
      const client = loadClient();

      await client.put('/items/1', { name: 'updated' });

      const [, init] = fetchMock.mock.calls[0];
      expect(init.method).toBe('PUT');
      expect(init.body).toBe(JSON.stringify({ name: 'updated' }));
    });

    it('PATCH request sends body as JSON', async () => {
      const fetchMock = mockFetch(200, { patched: true });
      globalThis.fetch = fetchMock;
      const client = loadClient();

      await client.patch('/items/1', { status: 'done' });

      const [, init] = fetchMock.mock.calls[0];
      expect(init.method).toBe('PATCH');
    });

    it('DELETE request sends correct method', async () => {
      const fetchMock = mockFetch(204);
      globalThis.fetch = fetchMock;
      const client = loadClient();

      const result = await client.delete('/items/1');

      const [, init] = fetchMock.mock.calls[0];
      expect(init.method).toBe('DELETE');
      expect(result.status).toBe(204);
    });
  });

  describe('Query params', () => {
    it('appends query parameters to URL', async () => {
      const fetchMock = mockFetch(200, []);
      globalThis.fetch = fetchMock;
      const client = loadClient();

      await client.get('/items', { params: { page: 2, status: 'active' } });

      const url: string = fetchMock.mock.calls[0][0];
      expect(url).toContain('page=2');
      expect(url).toContain('status=active');
    });

    it('omits undefined params', async () => {
      const fetchMock = mockFetch(200, []);
      globalThis.fetch = fetchMock;
      const client = loadClient();

      await client.get('/items', { params: { page: 1, status: undefined } });

      const url: string = fetchMock.mock.calls[0][0];
      expect(url).toContain('page=1');
      expect(url).not.toContain('status');
    });
  });

  describe('Error handling', () => {
    it('throws ApiClientError on non-ok response', async () => {
      const fetchMock = mockFetch(404, { message: 'Not found', code: 'NOT_FOUND' });
      globalThis.fetch = fetchMock;
      const client = loadClient();

      await expect(client.get('/missing')).rejects.toThrow('Not found');
      try {
        await client.get('/missing');
      } catch (err: unknown) {
        const e = err as { status: number; code: string; name: string };
        expect(e.name).toBe('ApiClientError');
        expect(e.status).toBe(404);
        expect(e.code).toBe('NOT_FOUND');
      }
    });

    it('throws ApiClientError with NETWORK_ERROR on fetch failure', async () => {
      globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      const client = loadClient();

      await expect(client.get('/offline')).rejects.toThrow('Failed to fetch');
      try {
        await client.get('/offline');
      } catch (err: unknown) {
        const e = err as { code: string; name: string };
        expect(e.name).toBe('ApiClientError');
        expect(e.code).toBe('NETWORK_ERROR');
      }
    });

    it('throws on abort / timeout with ABORT code', async () => {
      globalThis.fetch = jest.fn().mockRejectedValue(
        new DOMException('Aborted', 'AbortError')
      );
      const client = loadClient();

      await expect(client.get('/slow')).rejects.toThrow();
      try {
        await client.get('/slow');
      } catch (err: unknown) {
        const e = err as { code: string; name: string };
        expect(e.name).toBe('ApiClientError');
        expect(e.code).toBe('ABORT');
      }
    });
  });

  describe('Request interceptors', () => {
    it('modifies request through interceptor', async () => {
      const fetchMock = mockFetch(200, {});
      globalThis.fetch = fetchMock;
      const client = loadClient();

      client.onRequest(async (url, config) => {
        const headers = new Headers(config.headers);
        headers.set('X-Custom', 'test-value');
        return [url, { ...config, headers }];
      });

      await client.get('/test');

      const [, init] = fetchMock.mock.calls[0];
      const headers = new Headers(init.headers);
      expect(headers.get('X-Custom')).toBe('test-value');
    });

    it('auth interceptor adds token from wallet store', async () => {
      const fetchMock = mockFetch(200, {});
      globalThis.fetch = fetchMock;

      (localStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify({ state: { session: { token: 'my-jwt-token' } } })
      );

      const client = loadClient();
      await client.get('/protected');

      const [, init] = fetchMock.mock.calls[0];
      const headers = new Headers(init.headers);
      expect(headers.get('Authorization')).toBe('Bearer my-jwt-token');
    });

    it('proceeds without auth when no token stored', async () => {
      const fetchMock = mockFetch(200, {});
      globalThis.fetch = fetchMock;
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const client = loadClient();
      await client.get('/public');

      const [, init] = fetchMock.mock.calls[0];
      const headers = new Headers(init.headers);
      expect(headers.get('Authorization')).toBeNull();
    });
  });

  describe('Response interceptors', () => {
    it('transforms the response through interceptor', async () => {
      const fetchMock = mockFetch(200, { original: true });
      globalThis.fetch = fetchMock;
      const client = loadClient();

      client.onResponse(async (response) => {
        // return response as-is (interceptor ran)
        return response;
      });

      const result = await client.get('/transformed');
      expect(result.data).toEqual({ original: true });
    });
  });

  describe('Error interceptors', () => {
    it('runs error interceptor on API error', async () => {
      const fetchMock = mockFetch(500, { message: 'Internal Server Error' });
      globalThis.fetch = fetchMock;
      const client = loadClient();

      const intercepted: ApiClientError[] = [];
      client.onError((error) => {
        intercepted.push(error);
        return error;
      });

      await expect(client.get('/fail')).rejects.toThrow();
      expect(intercepted).toHaveLength(1);
      expect(intercepted[0].status).toBe(500);
    });
  });

  describe('Interceptor removal', () => {
    it('unregisters interceptor when dispose is called', async () => {
      const fetchMock = mockFetch(200, {});
      globalThis.fetch = fetchMock;
      const client = loadClient();

      let callCount = 0;
      const remove = client.onRequest(async (url, config) => {
        callCount++;
        return [url, config];
      });

      await client.get('/first');
      expect(callCount).toBe(1);

      remove();

      await client.get('/second');
      // Only the default auth interceptor should run, not our custom one
      expect(callCount).toBe(1);
    });
  });

  describe('Request cancellation', () => {
    it('cancelRequest aborts the controller', () => {
      const client = loadClient();
      const controller = client.createCancelToken('test-req');

      expect(controller.signal.aborted).toBe(false);
      client.cancelRequest('test-req');
      expect(controller.signal.aborted).toBe(true);
    });

    it('createCancelToken replaces previous controller with same key', () => {
      const client = loadClient();
      const first = client.createCancelToken('same-key');
      const second = client.createCancelToken('same-key');

      expect(first.signal.aborted).toBe(true);
      expect(second.signal.aborted).toBe(false);
    });

    it('cancelAll aborts all active controllers', () => {
      const client = loadClient();
      const a = client.createCancelToken('a');
      const b = client.createCancelToken('b');

      client.cancelAll();
      expect(a.signal.aborted).toBe(true);
      expect(b.signal.aborted).toBe(true);
    });
  });

  describe('Retry logic', () => {
    it('retries on failure when retries > 0', async () => {
      let callCount = 0;
      globalThis.fetch = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new TypeError('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Headers(),
          json: () => Promise.resolve({ success: true }),
        });
      });

      const client = loadClient();
      const result = await client.get<{ success: boolean }>('/retry-me', {
        retries: 3,
      });

      expect(result.data).toEqual({ success: true });
      expect(callCount).toBe(3);
    }, 30000);
  });

  describe('204 No Content', () => {
    it('handles 204 responses without trying to parse JSON', async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: new Headers(),
        json: jest.fn().mockRejectedValue(new Error('No body')),
      });
      const client = loadClient();

      const result = await client.delete('/items/1');
      expect(result.status).toBe(204);
      expect(result.data).toBeUndefined();
    });
  });
});
