"use client";

import React from "react";
import {
  Users,
  Calendar,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
} from "lucide-react";
import {
  calculatePercentage,
  calculateQuorumProgress,
  calculateDaysRemaining,
} from "@/lib/dao-utils";
import VoteProgressBar from "./VoteProgressBar";
import VotingInterface from "./VotingInterface";
import { Proposal, VoteType } from "@/types/dao-types";

interface ProposalCardProps {
  proposal: Proposal;
  onVote: (proposalId: string, voteType: VoteType) => Promise<void>;
}

export default function ProposalCard({ proposal, onVote }: ProposalCardProps) {
  // Calculate vote statistics
  const totalVotes =
    proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const forPercentage = calculatePercentage(proposal.votesFor, totalVotes);
  const againstPercentage = calculatePercentage(
    proposal.votesAgainst,
    totalVotes,
  );
  const abstainPercentage = calculatePercentage(
    proposal.votesAbstain,
    totalVotes,
  );
  const quorumProgress = calculateQuorumProgress(totalVotes, proposal.quorum);
  const daysRemaining = calculateDaysRemaining(proposal.endDate);

  return (
    <article
      className="bg-[#1A1F35] rounded-lg p-6 border border-gray-700/50 hover:border-[#22BBF9]/30 transition-all"
      aria-label={`Proposal: ${proposal.title}`}
    >
      {/* Proposal Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-semibold text-lg">
              {proposal.title}
            </h3>
            {proposal.hasVoted && (
              <span className="flex items-center gap-1 text-xs bg-[#B6FA9E]/20 text-[#B6FA9E] px-2 py-1 rounded" aria-label="You have voted on this proposal">
                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                Voted
              </span>
            )}
          </div>

          <p className="text-gray-400 text-sm mb-3">{proposal.description}</p>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-gray-500" aria-label="Proposal metadata">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" aria-hidden="true" />
              <span className="sr-only">Proposed by: </span>
              {proposal.proposerName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              <span className="sr-only">Time remaining: </span>
              {daysRemaining} days left
            </span>
            <span className="text-gray-600">
              <span className="sr-only">Proposal </span>ID: {proposal.id}
            </span>
          </div>
        </div>
      </div>

      {/* Voting Results */}
      <div className="mb-6">
        {/* Total Votes and Quorum */}
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-400">
            Total Votes: {totalVotes.toLocaleString()}
          </span>
          <span className="text-gray-400">
            Quorum: {quorumProgress}% ({totalVotes.toLocaleString()}/
            {proposal.quorum.toLocaleString()})
          </span>
        </div>

        {/* For Votes Progress Bar */}
        <VoteProgressBar
          percentage={forPercentage}
          votes={proposal.votesFor}
          color="text-[#B6FA9E]"
          bgColor="bg-[#B6FA9E]"
          label="For"
          icon={<ThumbsUp className="w-4 h-4" />}
        />

        {/* Against Votes Progress Bar */}
        <VoteProgressBar
          percentage={againstPercentage}
          votes={proposal.votesAgainst}
          color="text-[#ff6467]"
          bgColor="bg-[#ff6467]"
          label="Against"
          icon={<ThumbsDown className="w-4 h-4" />}
        />

        {/* Abstain Votes Progress Bar */}
        <VoteProgressBar
          percentage={abstainPercentage}
          votes={proposal.votesAbstain}
          color="text-[#99a1af]"
          bgColor="bg-[#99a1af]"
          label="Abstain"
          icon={<MinusCircle className="w-4 h-4" />}
        />
      </div>

      {/* Voting Interface */}
      <VotingInterface
        proposalId={proposal.id}
        userVotingPower={proposal.userVotingPower}
        hasVoted={proposal.hasVoted}
        userVote={proposal.userVote}
        onVote={onVote}
      />
    </article>
  );
}
