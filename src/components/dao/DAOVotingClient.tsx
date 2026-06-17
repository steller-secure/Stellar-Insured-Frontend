"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";

import ProposalCard from "./ProposalCard";
import ProposalStats from "./ProposalStats";
import ProposalFilters from "./ProposalFilters";
import { Proposal, VoteType } from "@/types/dao-types";
import { getProposalStats } from "@/lib/dao-utils";
import { useTransactionHandler } from "@/hooks/useTransactionHandler";
import { useNotificationContext } from "@/context/NotificationContext";

interface DAOVotingClientProps {
  initialProposals: Proposal[];
}

export default function DAOVotingClient({
  initialProposals,
}: DAOVotingClientProps) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [votingProposalId, setVotingProposalId] = useState<string | null>(null);
  const { execute: executeTransaction, error: voteError, clearError } = useTransactionHandler({
    showSuccessToast: false,
  });
  const { addNotification } = useNotificationContext();

  /**
   * Handle vote submission
   * In production, this would call smart contract methods
   */
  const handleVote = async (
    proposalId: string,
    voteType: VoteType,
  ): Promise<void> => {
    clearError();
    setVotingProposalId(proposalId);

    const result = await executeTransaction(
      async () => {
        // Simulate blockchain transaction delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setProposals((prevProposals) =>
          prevProposals.map((proposal) => {
            if (proposal.id === proposalId) {
              const voteAmount = proposal.userVotingPower;

              const updatedVotes = {
                votesFor:
                  voteType === "for"
                    ? proposal.votesFor + voteAmount
                    : proposal.votesFor,
                votesAgainst:
                  voteType === "against"
                    ? proposal.votesAgainst + voteAmount
                    : proposal.votesAgainst,
                votesAbstain:
                  voteType === "abstain"
                    ? proposal.votesAbstain + voteAmount
                    : proposal.votesAbstain,
              };

              return {
                ...proposal,
                ...updatedVotes,
                totalVotes: proposal.totalVotes + voteAmount,
                hasVoted: true,
                userVote: voteType,
              };
            }
            return proposal;
          }),
        );

        return { proposalId, voteType };
      },
      { action: "dao_vote", proposalId, voteType },
    );

    if (result) {
      addNotification("Vote submitted successfully!", "success");
    }

    setVotingProposalId(null);
  };

  /**
   * Filter proposals based on search and filter criteria
   */
  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch =
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "voted" && proposal.hasVoted) ||
      (filter === "unvoted" && !proposal.hasVoted);

    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = getProposalStats(proposals);

  return (
    <div className="min-h-screen bg-[#0A0F1F] text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">DAO Governance</h1>
              <p className="text-gray-400">
                Participate in governance decisions and shape the future
              </p>
            </div>
            <button className="bg-[#22BBF9] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#22BBF9]/90 transition-all w-full sm:w-auto">
              + New Proposal
            </button>
          </div>

          {/* Display vote errors */}
          {voteError && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-500" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-500">{voteError.title}</h3>
                  <p className="mt-1 text-sm text-red-400">{voteError.message}</p>
                  {voteError.remediationStep && (
                    <p className="mt-2 text-sm text-red-300">{voteError.remediationStep}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  className="flex-shrink-0 text-red-400 hover:text-red-300"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <ProposalStats
            activeProposals={stats.activeProposals}
            votedProposals={stats.votedProposals}
            totalVotingPower={stats.totalVotingPower}
          />

          {/* Search and Filters */}
          <ProposalFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filter={filter}
            onFilterChange={setFilter}
          />
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          {filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onVote={handleVote}
              />
            ))
          ) : (
            <div className="bg-[#1A1F35] rounded-lg p-12 text-center border border-gray-700/50">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No proposals found</p>
              <p className="text-gray-500 text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
