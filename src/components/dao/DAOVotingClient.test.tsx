import { render, screen } from '@testing-library/react';
import DAOVotingClient from '@/components/dao/DAOVotingClient';
import { mockProposals } from '@/data/dao-mockData';

describe('DAOVotingClient', () => {
  it('renders proposals list', () => {
    render(<DAOVotingClient initialProposals={mockProposals} />);
    
    expect(screen.getByText('DAO Governance')).toBeInTheDocument();
  });

  it('renders proposal titles', () => {
    render(<DAOVotingClient initialProposals={mockProposals} />);
    
    const firstProposal = mockProposals[0];
    expect(screen.getByText(firstProposal.title)).toBeInTheDocument();
  });

  it('shows new proposal button', () => {
    render(<DAOVotingClient initialProposals={mockProposals} />);
    
    expect(screen.getByRole('button', { name: /new proposal/i })).toBeInTheDocument();
  });
});
