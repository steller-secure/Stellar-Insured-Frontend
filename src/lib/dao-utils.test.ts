import { getProposalStats } from '@/lib/dao-utils';
import { Proposal } from '@/types/dao-types';

describe('dao-utils', () => {
  const mockProposals: Proposal[] = [
    {
      id: '1',
      title: 'Test 1',
      description: 'Desc 1',
      proposer: '0x123',
      proposerName: 'Alice',
      status: 'active',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      votesFor: 100,
      votesAgainst: 50,
      votesAbstain: 10,
      totalVotes: 160,
      quorum: 100,
      userVotingPower: 10,
      hasVoted: true,
      userVote: 'for',
    },
    {
      id: '2',
      title: 'Test 2',
      description: 'Desc 2',
      proposer: '0x456',
      proposerName: 'Bob',
      status: 'active',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      votesFor: 200,
      votesAgainst: 100,
      votesAbstain: 20,
      totalVotes: 320,
      quorum: 100,
      userVotingPower: 10,
      hasVoted: false,
      userVote: null,
    },
  ];

  describe('getProposalStats', () => {
    it('calculates correct statistics', () => {
      const stats = getProposalStats(mockProposals);

      expect(stats.activeProposals).toBe(2);
      expect(stats.votedProposals).toBe(1);
      expect(stats.totalVotingPower).toBe(10); // Returns first proposal's voting power
    });

    it('handles empty proposals array', () => {
      const stats = getProposalStats([]);

      expect(stats.activeProposals).toBe(0);
      expect(stats.votedProposals).toBe(0);
      expect(stats.totalVotingPower).toBe(0);
    });

    it('counts only active proposals', () => {
      const proposals: Proposal[] = [
        { ...mockProposals[0], status: 'active' },
        { ...mockProposals[1], status: 'expired' },
      ];

      const stats = getProposalStats(proposals);

      expect(stats.activeProposals).toBe(1);
    });
  });
});
