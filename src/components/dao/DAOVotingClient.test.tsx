import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    
    expect(
      screen.getByRole('button', { name: 'Create a new governance proposal' }),
    ).toBeInTheDocument();
  });

  it('opens the create proposal modal when clicking New Proposal', async () => {
    const user = userEvent.setup();
    render(<DAOVotingClient initialProposals={mockProposals} />);

    await user.click(
      screen.getByRole('button', { name: 'Create a new governance proposal' }),
    );

    expect(screen.getByText('Create Proposal')).toBeInTheDocument();
    expect(screen.getByLabelText(/proposal title/i)).toBeInTheDocument();
  });
});
