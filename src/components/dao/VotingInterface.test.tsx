import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VotingInterface from './VotingInterface';
import { VoteType } from '@/types/dao-types';

describe('VotingInterface', () => {
  const mockOnVote = jest.fn();

  beforeEach(() => {
    mockOnVote.mockClear();
  });

  it('displays voting power', () => {
    render(
      <VotingInterface
        proposalId="1"
        userVotingPower={100}
        hasVoted={false}
        userVote={null}
        onVote={mockOnVote}
      />
    );
    expect(screen.getByText('100 votes')).toBeInTheDocument();
  });

  it('allows selecting vote options', async () => {
    const user = userEvent.setup();
    render(
      <VotingInterface
        proposalId="1"
        userVotingPower={100}
        hasVoted={false}
        userVote={null}
        onVote={mockOnVote}
      />
    );

    await user.click(screen.getByText('For'));
    expect(screen.getByText('Cast Vote')).not.toBeDisabled();
  });

  it('submits vote when cast button clicked', async () => {
    const user = userEvent.setup();
    mockOnVote.mockResolvedValue(undefined);

    render(
      <VotingInterface
        proposalId="1"
        userVotingPower={100}
        hasVoted={false}
        userVote={null}
        onVote={mockOnVote}
      />
    );

    await user.click(screen.getByText('Against'));
    await user.click(screen.getByText('Cast Vote'));

    await waitFor(() => {
      expect(mockOnVote).toHaveBeenCalledWith('1', 'against');
    });
  });

  it('shows already voted state', () => {
    render(
      <VotingInterface
        proposalId="1"
        userVotingPower={100}
        hasVoted={true}
        userVote={'for' as VoteType}
        onVote={mockOnVote}
      />
    );
    expect(screen.getByText('You voted: FOR')).toBeInTheDocument();
  });

  it('disables submit when no vote selected', () => {
    render(
      <VotingInterface
        proposalId="1"
        userVotingPower={100}
        hasVoted={false}
        userVote={null}
        onVote={mockOnVote}
      />
    );
    expect(screen.getByText('Cast Vote')).toBeDisabled();
  });

  it('handles vote error gracefully', async () => {
    const user = userEvent.setup();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockOnVote.mockRejectedValue(new Error('Vote failed'));

    render(
      <VotingInterface
        proposalId="1"
        userVotingPower={100}
        hasVoted={false}
        userVote={null}
        onVote={mockOnVote}
      />
    );

    await user.click(screen.getByText('Abstain'));
    await user.click(screen.getByText('Cast Vote'));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
