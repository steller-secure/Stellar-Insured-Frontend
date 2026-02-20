import { render, screen } from '@testing-library/react';
import ProposalStats from './ProposalStats';

describe('ProposalStats', () => {
  it('renders active proposals count', () => {
    render(<ProposalStats activeProposals={5} votedProposals={3} totalVotingPower={100} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Active Proposals')).toBeInTheDocument();
  });

  it('renders voted proposals count', () => {
    render(<ProposalStats activeProposals={5} votedProposals={3} totalVotingPower={100} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Your Votes')).toBeInTheDocument();
  });

  it('renders voting power', () => {
    render(<ProposalStats activeProposals={5} votedProposals={3} totalVotingPower={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Voting Power')).toBeInTheDocument();
  });
});
