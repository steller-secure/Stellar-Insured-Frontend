import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient as render } from '@/test-utils/renderWithQueryClient';
import DAOVotingClient from '@/components/dao/DAOVotingClient';
import { mockDb } from '@/mocks/db';

describe('DAOVotingClient', () => {
  it('renders proposals list', () => {
    render(<DAOVotingClient initialProposals={mockDb.getProposals()} />);
    
    expect(screen.getByText('DAO Governance')).toBeInTheDocument();
  });

  it('renders proposal titles', () => {
    render(<DAOVotingClient initialProposals={mockDb.getProposals()} />);
    
    const firstProposal = mockDb.getProposals()[0];
    expect(screen.getByText(firstProposal.title)).toBeInTheDocument();
  });

  it('shows new proposal button', () => {
    render(<DAOVotingClient initialProposals={mockDb.getProposals()} />);
    
    expect(
      screen.getByRole('button', { name: 'Create a new governance proposal' }),
    ).toBeInTheDocument();
  });

  it('opens the create proposal modal when clicking New Proposal', async () => {
    const user = userEvent.setup();
    render(<DAOVotingClient initialProposals={mockDb.getProposals()} />);

    await user.click(
      screen.getByRole('button', { name: 'Create a new governance proposal' }),
    );

    expect(screen.getByText('Create Proposal')).toBeInTheDocument();
    expect(screen.getByLabelText(/proposal title/i)).toBeInTheDocument();
    render(<DAOVotingClient initialProposals={mockDb.getProposals()} />);
    expect(screen.getByRole('button', { name: /create a new governance proposal/i })).toBeInTheDocument();
  });
});
