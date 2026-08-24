import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { proposalSchema, type Proposal, type ProposalStatus } from '@/types/api';
import { blockchainEvents, type BlockchainEvent } from '@/lib/blockchainEvents';

/** In-memory store backing the mock proposal service. */
let proposals: Proposal[] = [];

/** Input accepted by {@link proposalService.createProposal}. */
const createProposalInputSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});
export type CreateProposalInput = z.infer<typeof createProposalInputSchema>;

/** Length of the default voting window applied to new proposals (30 days). */
const VOTING_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export const proposalService = {
  /** Refetch triggers for governance-related on-chain events. */
  subscribe: (listener: (event: BlockchainEvent) => void) =>
    blockchainEvents.subscribe(listener, ['proposal.updated', 'vote.cast']),

  createProposal: (data: CreateProposalInput): Proposal => {
    const { title, description } = createProposalInputSchema.parse(data);
    const now = Date.now();
    const proposal = proposalSchema.parse({
      id: uuidv4(),
      title,
      description,
      proposer: 'currentUser',
      proposerName: 'Current User',
      status: 'pending',
      startDate: new Date(now).toISOString(),
      endDate: new Date(now + VOTING_WINDOW_MS).toISOString(),
      votesFor: 0,
      votesAgainst: 0,
      votesAbstain: 0,
      totalVotes: 0,
      quorum: 5,
      userVotingPower: 100,
      hasVoted: false,
      userVote: null,
    });
    proposals.push(proposal);
    return proposal;
  },

  updateProposal: (id: string, updates: Partial<Proposal>): Proposal | null => {
    const index = proposals.findIndex((p) => p.id === id);
    if (index === -1) return null;
    proposals[index] = proposalSchema.parse({ ...proposals[index], ...updates });
    return proposals[index];
  },

  deleteProposal: (id: string): boolean => {
    const index = proposals.findIndex((p) => p.id === id);
    if (index === -1) return false;
    proposals.splice(index, 1);
    return true;
  },

  listProposals: (filter?: ProposalStatus): Proposal[] => {
    return filter ? proposals.filter((p) => p.status === filter) : proposals;
  },
};
