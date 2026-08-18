import { Proposal, ProposalStatus } from '../types/proposal';
import { v4 as uuidv4 } from 'uuid';
import { blockchainEvents, type BlockchainEvent } from '@/lib/blockchainEvents';

const proposals: Proposal[] = [];

export const proposalService = {
  subscribe: (listener: (event: BlockchainEvent) => void) =>
    blockchainEvents.subscribe(listener, ['proposal.updated', 'vote.cast']),
  createProposal: (data: Omit<Proposal, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Proposal => {
    const proposal: Proposal = {
      ...data,
      id: uuidv4(),
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    proposals.push(proposal);
    return proposal;
  },

  updateProposal: (id: string, updates: Partial<Proposal>): Proposal | null => {
    const index = proposals.findIndex(p => p.id === id);
    if (index === -1) return null;
    proposals[index] = { ...proposals[index], ...updates, updatedAt: new Date() };
    return proposals[index];
  },

  deleteProposal: (id: string): boolean => {
    const index = proposals.findIndex(p => p.id === id);
    if (index === -1) return false;
    proposals.splice(index, 1);
    return true;
  },

  listProposals: (filter?: ProposalStatus): Proposal[] => {
    return filter ? proposals.filter(p => p.status === filter) : proposals;
  },
};
