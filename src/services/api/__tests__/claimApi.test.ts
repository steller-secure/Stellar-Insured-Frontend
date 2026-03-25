/**
 * Tests for claimApi service module.
 */

import apiClient from '@/lib/api-client';
import { claimApi } from '@/services/api/claimApi';

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

describe('claimApi', () => {
  describe('list', () => {
    it('calls GET /api/claims with params and cancel token', async () => {
      mockedClient.get.mockResolvedValue({
        data: { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 },
        status: 200,
        headers: new Headers(),
      });

      await claimApi.list({ status: 'Pending', page: 1 });

      expect(mockedClient.createCancelToken).toHaveBeenCalledWith('claim-list');
      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/claims',
        expect.objectContaining({
          params: { status: 'Pending', page: 1 },
          retries: 1,
        })
      );
    });
  });

  describe('getById', () => {
    it('calls GET /api/claims/:id', async () => {
      const claim = { id: 'CLM-001', policyId: 'p1', status: 'Active' };
      mockedClient.get.mockResolvedValue({ data: claim, status: 200, headers: new Headers() });

      const result = await claimApi.getById('CLM-001');

      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/claims/CLM-001',
        expect.anything()
      );
      expect(result.data).toEqual(claim);
    });
  });

  describe('create', () => {
    it('calls POST /api/claims with body', async () => {
      const payload = {
        policyId: 'p1',
        incidentType: 'Wallet Hack',
        amount: 5000,
        description: 'Lost funds',
      };
      mockedClient.post.mockResolvedValue({
        data: { id: 'CLM-NEW', ...payload, status: 'Pending' },
        status: 201,
        headers: new Headers(),
      });

      const result = await claimApi.create(payload);

      expect(mockedClient.post).toHaveBeenCalledWith('/api/claims', payload, undefined);
      expect(result.data).toMatchObject({ id: 'CLM-NEW' });
    });
  });

  describe('update', () => {
    it('calls PATCH /api/claims/:id with body', async () => {
      mockedClient.patch.mockResolvedValue({
        data: { id: 'CLM-001', status: 'Approved' },
        status: 200,
        headers: new Headers(),
      });

      await claimApi.update('CLM-001', { status: 'Approved' });

      expect(mockedClient.patch).toHaveBeenCalledWith(
        '/api/claims/CLM-001',
        { status: 'Approved' },
        undefined
      );
    });
  });

  describe('remove', () => {
    it('calls DELETE /api/claims/:id', async () => {
      mockedClient.delete.mockResolvedValue({ data: undefined, status: 204, headers: new Headers() });

      await claimApi.remove('CLM-001');

      expect(mockedClient.delete).toHaveBeenCalledWith('/api/claims/CLM-001', undefined);
    });
  });

  describe('getStatistics', () => {
    it('calls GET /api/claims/statistics', async () => {
      mockedClient.get.mockResolvedValue({
        data: { totalClaims: 5, pendingClaims: 2, approvedClaims: 3, totalClaimedAmount: 25000 },
        status: 200,
        headers: new Headers(),
      });

      const result = await claimApi.getStatistics();

      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/claims/statistics',
        expect.objectContaining({ retries: 1 })
      );
      expect(result.data.totalClaims).toBe(5);
    });
  });

  describe('cancelAll', () => {
    it('cancels all claim-related requests', () => {
      claimApi.cancelAll();

      expect(mockedClient.cancelRequest).toHaveBeenCalledWith('claim-list');
      expect(mockedClient.cancelRequest).toHaveBeenCalledWith('claim-detail');
    });
  });
});
