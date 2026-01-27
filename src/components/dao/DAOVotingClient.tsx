"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";

import ProposalCard from "./ProposalCard";
import ProposalStats from "./ProposalStats";
import ProposalFilters from "./ProposalFilters";
import { Proposal, VoteType } from "@/types/dao-types";
import { getProposalStats } from "@/lib/dao-utils";

interface DAOVotingClientProps {
  initialProposals: Proposal[];
}

export default function DAOVotingClient({
  initialProposals,
}: DAOVotingClientProps) {
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Handle vote submission
   * In production, this would call smart contract methods
   */
  const handleVote = async (
    proposalId: string,
    voteType: VoteType,
  ): Promise<void> => {
    // Simulate blockchain transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setProposals((prevProposals) =>
      prevProposals.map((proposal) => {
        if (proposal.id === proposalId) {
          const voteAmount = proposal.userVotingPower;

          // Update vote counts based on vote type
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
