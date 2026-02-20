import { render, screen } from '@testing-library/react';
import ProposalCard from '@/components/dao/ProposalCard';
import { Proposal } from '@/types/dao-types';

describe('ProposalCard', () => {
  const mockProposal: Proposal = {
    id: 'PROP-001',
    title: 'Test Proposal',
    description: 'Test description',
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
    hasVoted: false,
    userVote: null,
  };

  const mockOnVote = jest.fn();

  it('renders proposal information', () => {
    render(<ProposalCard proposal={mockProposal} onVote={mockOnVote} />);
    
    expect(screen.getByText('Test Proposal')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('displays proposer name', () => {
    render(<ProposalCard proposal={mockProposal} onVote={mockOnVote} />);
    
    expect(screen.getByText(/Alice/i)).toBeInTheDocument();
  });

  it('shows voting buttons when not voted', () => {
    render(<ProposalCard proposal={mockProposal} onVote={mockOnVote} />);
    
    expect(screen.getByRole('button', { name: /for/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /against/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /abstain/i })).toBeInTheDocument();
  });

  it('shows voted status when user has voted', () => {
    const votedProposal = { ...mockProposal, hasVoted: true, userVote: 'for' as const };
    render(<ProposalCard proposal={votedProposal} onVote={mockOnVote} />);
    
    expect(screen.getByText(/You voted/i)).toBeInTheDocument();
  });
});
