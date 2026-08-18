/**
 * Accessibility tests for src/components/dao/ components.
 * Uses jest-axe to automatically detect WCAG 2.1 AA violations.
 *
 * WCAG references:
 *   1.1.1  Non-text Content
 *   1.3.1  Info and Relationships
 *   2.1.1  Keyboard
 *   4.1.2  Name, Role, Value
 *   4.1.3  Status Messages
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThumbsUp, ThumbsDown, MinusCircle } from 'lucide-react';

expect.extend(toHaveNoViolations);

import VoteProgressBar from '../VoteProgressBar';
import VotingButton from '../VotingButton';
import VotingInterface from '../VotingInterface';
import ProposalCard from '../ProposalCard';

// ─── Shared mock data ──────────────────────────────────────────────────────────

const mockProposal = {
  id: 'PROP-001',
  title: 'Increase claim payout limit',
  description: 'Proposal to raise the maximum single-claim payout from $50k to $100k.',
  proposer: '0xabc',
  proposerName: 'Alice',
  status: 'active' as const,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  votesFor: 300,
  votesAgainst: 100,
  votesAbstain: 50,
  totalVotes: 450,
  quorum: 400,
  userVotingPower: 10,
  hasVoted: false,
  userVote: null,
};

// ─── VoteProgressBar ──────────────────────────────────────────────────────────

describe('VoteProgressBar – accessibility (jest-axe)', () => {
  it('has no violations for a "For" bar', async () => {
    const { container } = render(
      <VoteProgressBar
        percentage="60"
        votes={300}
        color="text-green-400"
        bgColor="bg-green-400"
        label="For"
        icon={<ThumbsUp className="w-4 h-4" />}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations for an "Against" bar', async () => {
    const { container } = render(
      <VoteProgressBar
        percentage="25"
        votes={100}
        color="text-red-400"
        bgColor="bg-red-400"
        label="Against"
        icon={<ThumbsDown className="w-4 h-4" />}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations for an "Abstain" bar', async () => {
    const { container } = render(
      <VoteProgressBar
        percentage="15"
        votes={50}
        color="text-gray-400"
        bgColor="bg-gray-400"
        label="Abstain"
        icon={<MinusCircle className="w-4 h-4" />}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations at 0%', async () => {
    const { container } = render(
      <VoteProgressBar
        percentage="0"
        votes={0}
        color="text-green-400"
        bgColor="bg-green-400"
        label="For"
        icon={<ThumbsUp className="w-4 h-4" />}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── VotingButton ─────────────────────────────────────────────────────────────

describe('VotingButton – accessibility (jest-axe)', () => {
  it('has no violations when unselected', async () => {
    const { container } = render(
      <VotingButton
        voteType="for"
        selected={false}
        icon={<ThumbsUp className="w-5 h-5" />}
        label="For"
        onClick={jest.fn()}
        activeColor="bg-green-400/20 text-green-400"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when selected (aria-pressed=true)', async () => {
    const { container } = render(
      <VotingButton
        voteType="for"
        selected={true}
        icon={<ThumbsUp className="w-5 h-5" />}
        label="For"
        onClick={jest.fn()}
        activeColor="bg-green-400/20 text-green-400"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations for Against and Abstain variants', async () => {
    const { container } = render(
      <div>
        <VotingButton
          voteType="against"
          selected={false}
          icon={<ThumbsDown className="w-5 h-5" />}
          label="Against"
          onClick={jest.fn()}
          activeColor="bg-red-400/20 text-red-400"
        />
        <VotingButton
          voteType="abstain"
          selected={false}
          icon={<MinusCircle className="w-5 h-5" />}
          label="Abstain"
          onClick={jest.fn()}
          activeColor="bg-gray-400/20 text-gray-400"
        />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── VotingInterface ──────────────────────────────────────────────────────────

describe('VotingInterface – accessibility (jest-axe)', () => {
  it('has no violations when user has not voted', async () => {
    const { container } = render(
      <VotingInterface
        proposalId="PROP-001"
        userVotingPower={10}
        hasVoted={false}
        userVote={null}
        onVote={jest.fn()}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when user has already voted', async () => {
    const { container } = render(
      <VotingInterface
        proposalId="PROP-001"
        userVotingPower={10}
        hasVoted={true}
        userVote="for"
        onVote={jest.fn()}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ─── ProposalCard ─────────────────────────────────────────────────────────────

describe('ProposalCard – accessibility (jest-axe)', () => {
  it('has no violations for an unvoted proposal', async () => {
    const { container } = render(
      <ProposalCard proposal={mockProposal} onVote={jest.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when the user has already voted', async () => {
    const votedProposal = {
      ...mockProposal,
      hasVoted: true,
      userVote: 'for' as const,
    };
    const { container } = render(
      <ProposalCard proposal={votedProposal} onVote={jest.fn()} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
