/**
 * Tests for policyApi service module.
 */

import apiClient from '@/lib/api-client';
import { policyApi } from '@/services/api/policyApi';

// Mock the API client
jest.mock('@/lib/api-client', () => {
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    createCancelToken: jest.fn(() => ({ signal: new AbortController().signal })),
    cancelRequest: jest.fn(),
  };
  return { __esModule: true, default: mockClient, apiClient: mockClient };
});

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('policyApi', () => {
  describe('list', () => {
    it('calls GET /api/policies with params', async () => {
      const mockResponse = {
        data: { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 },
        status: 200,
        headers: new Headers(),
      };
      mockedClient.get.mockResolvedValue(mockResponse);

      const result = await policyApi.list({ status: 'active', page: 1 });

      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/policies',
        expect.objectContaining({
          params: { status: 'active', page: 1 },
          retries: 1,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('creates a cancel token for list requests', async () => {
      mockedClient.get.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });

      await policyApi.list();

      expect(mockedClient.createCancelToken).toHaveBeenCalledWith('policy-list');
    });
  });

  describe('getById', () => {
    it('calls GET /api/policies/:id', async () => {
      const mockPolicy = { id: 'p1', name: 'Test Policy' };
      mockedClient.get.mockResolvedValue({ data: mockPolicy, status: 200, headers: new Headers() });

      const result = await policyApi.getById('p1');

      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/policies/p1',
        expect.objectContaining({})
      );
      expect(result.data).toEqual(mockPolicy);
    });

    it('encodes special characters in ID', async () => {
      mockedClient.get.mockResolvedValue({ data: {}, status: 200, headers: new Headers() });

      await policyApi.getById('p/1');

      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/policies/p%2F1',
        expect.anything()
      );
    });
  });

  describe('create', () => {
    it('calls POST /api/policies with body', async () => {
      const newPolicy = { name: 'New', type: 'Health' as const, coverageLimit: 50000 };
      mockedClient.post.mockResolvedValue({ data: { id: 'p99', ...newPolicy }, status: 201, headers: new Headers() });

      const result = await policyApi.create(newPolicy);

      expect(mockedClient.post).toHaveBeenCalledWith('/api/policies', newPolicy, undefined);
      expect(result.data).toMatchObject({ id: 'p99', name: 'New' });
    });
  });

  describe('update', () => {
    it('calls PUT /api/policies/:id with body', async () => {
      mockedClient.put.mockResolvedValue({ data: { id: 'p1', name: 'Updated' }, status: 200, headers: new Headers() });

      await policyApi.update('p1', { name: 'Updated' });

      expect(mockedClient.put).toHaveBeenCalledWith(
        '/api/policies/p1',
        { name: 'Updated' },
        undefined
      );
    });
  });

  describe('remove', () => {
    it('calls DELETE /api/policies/:id', async () => {
      mockedClient.delete.mockResolvedValue({ data: undefined, status: 204, headers: new Headers() });

      await policyApi.remove('p1');

      expect(mockedClient.delete).toHaveBeenCalledWith('/api/policies/p1', undefined);
    });
  });

  describe('calculatePremium', () => {
    it('calls POST /api/policies/premium', async () => {
      const payload = { policyType: 'Health' as const, coverageLimit: 50000 };
      mockedClient.post.mockResolvedValue({
        data: { basePremium: 200, finalPremium: 250, riskMultiplier: 1.25, breakdown: {} },
        status: 200,
        headers: new Headers(),
      });

      await policyApi.calculatePremium(payload);

      expect(mockedClient.post).toHaveBeenCalledWith(
        '/api/policies/premium',
        payload,
        expect.objectContaining({})
      );
    });
  });

  describe('getStatistics', () => {
    it('calls GET /api/policies/statistics with retry', async () => {
      mockedClient.get.mockResolvedValue({
        data: { totalPolicies: 10, activePolicies: 8, totalCoverage: 500000, averagePremium: 300 },
        status: 200,
        headers: new Headers(),
      });

      await policyApi.getStatistics();

      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/policies/statistics',
        expect.objectContaining({ retries: 1 })
      );
    });
  });

  describe('cancelAll', () => {
    it('cancels all policy-related requests', () => {
      policyApi.cancelAll();

      expect(mockedClient.cancelRequest).toHaveBeenCalledWith('policy-list');
      expect(mockedClient.cancelRequest).toHaveBeenCalledWith('policy-detail');
      expect(mockedClient.cancelRequest).toHaveBeenCalledWith('policy-premium');
    });
  });
});
