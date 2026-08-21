import { Proposal, ProposalStatus } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';
import { DataService } from '@/config/dataSource';

export const proposalService = {
  createProposal: async (data: Omit<Proposal, 'id' | 'status' | 'startDate' | 'endDate' | 'votesFor' | 'votesAgainst' | 'votesAbstain' | 'totalVotes' | 'quorum' | 'userVotingPower' | 'hasVoted' | 'userVote'>): Promise<Proposal> => {
    const proposal: Proposal = {
      ...data,
      id: uuidv4(),
      status: 'pending',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      totalVotes: 0,
      quorum: 10000,
      userVotingPower: 250,
      hasVoted: false,
      userVote: null,
    };
    await DataService.createProposal(proposal);
    return proposal;
  },

  updateProposal: async (id: string, updates: Partial<Proposal>): Promise<Proposal | null> => {
    const updated = await DataService.updateProposal(id, updates);
    return updated || null;
  },

  deleteProposal: async (id: string): Promise<boolean> => {
    return DataService.deleteProposal(id);
  },

  listProposals: async (filter?: ProposalStatus): Promise<Proposal[]> => {
    const proposals = await DataService.getProposals();
    return filter ? proposals.filter(p => p.status === filter) : proposals;
  },
};
