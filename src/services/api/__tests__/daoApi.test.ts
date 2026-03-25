/**
 * Tests for daoApi service module.
 */

import apiClient from '@/lib/api-client';
import { daoApi } from '@/services/api/daoApi';

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

describe('daoApi', () => {
  describe('listProposals', () => {
    it('calls GET /api/dao/proposals with params', async () => {
      mockedClient.get.mockResolvedValue({
        data: { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0 },
        status: 200,
        headers: new Headers(),
      });

      await daoApi.listProposals({ status: 'active', page: 1 });

      expect(mockedClient.createCancelToken).toHaveBeenCalledWith('dao-proposal-list');
      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/dao/proposals',
        expect.objectContaining({
          params: { status: 'active', page: 1 },
          retries: 1,
        })
      );
    });
  });

  describe('getProposalById', () => {
    it('calls GET /api/dao/proposals/:id', async () => {
      const proposal = { id: 'PROP-001', title: 'Test Proposal' };
      mockedClient.get.mockResolvedValue({ data: proposal, status: 200, headers: new Headers() });

      const result = await daoApi.getProposalById('PROP-001');

      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/dao/proposals/PROP-001',
        expect.anything()
      );
      expect(result.data).toEqual(proposal);
    });
  });

  describe('createProposal', () => {
    it('calls POST /api/dao/proposals with body', async () => {
      const payload = {
        title: 'New Proposal',
        description: 'Description',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      };
      mockedClient.post.mockResolvedValue({
        data: { id: 'PROP-NEW', ...payload },
        status: 201,
        headers: new Headers(),
      });

      const result = await daoApi.createProposal(payload);

      expect(mockedClient.post).toHaveBeenCalledWith('/api/dao/proposals', payload, undefined);
      expect(result.data).toMatchObject({ id: 'PROP-NEW' });
    });
  });

  describe('castVote', () => {
    it('calls POST /api/dao/proposals/:id/vote with vote type', async () => {
      mockedClient.post.mockResolvedValue({
        data: { success: true, updatedProposal: { id: 'PROP-001' } },
        status: 200,
        headers: new Headers(),
      });

      const result = await daoApi.castVote('PROP-001', 'for');

      expect(mockedClient.post).toHaveBeenCalledWith(
        '/api/dao/proposals/PROP-001/vote',
        { vote: 'for' },
        undefined
      );
      expect(result.data.success).toBe(true);
    });

    it('supports all vote types', async () => {
      mockedClient.post.mockResolvedValue({
        data: { success: true, updatedProposal: {} },
        status: 200,
        headers: new Headers(),
      });

      for (const vote of ['for', 'against', 'abstain'] as const) {
        await daoApi.castVote('PROP-001', vote);
      }

      expect(mockedClient.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('getStatistics', () => {
    it('calls GET /api/dao/statistics with retry', async () => {
      mockedClient.get.mockResolvedValue({
        data: { activeProposals: 3, votedProposals: 1, totalVotingPower: 250 },
        status: 200,
        headers: new Headers(),
      });

      const result = await daoApi.getStatistics();

      expect(mockedClient.get).toHaveBeenCalledWith(
        '/api/dao/statistics',
        expect.objectContaining({ retries: 1 })
      );
      expect(result.data.activeProposals).toBe(3);
    });
  });

  describe('cancelAll', () => {
    it('cancels all DAO-related requests', () => {
      daoApi.cancelAll();

      expect(mockedClient.cancelRequest).toHaveBeenCalledWith('dao-proposal-list');
      expect(mockedClient.cancelRequest).toHaveBeenCalledWith('dao-proposal-detail');
    });
  });
});
