"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

import ProposalCard from "./ProposalCard";
import ProposalStats from "./ProposalStats";
import ProposalFilters from "./ProposalFilters";
import { Proposal, VoteType } from "@/types/dao-types";
import { getProposalStats } from "@/lib/dao-utils";
import { useTransactionHandler } from "@/hooks/useTransactionHandler";
import { useNotificationContext } from "@/context/NotificationContext";
import { ProposalCardSkeleton, EmptyState, ErrorState } from "@/components/ui/SkeletonLoaders";
import { blockchainEvents } from "@/lib/blockchainEvents";
import { CreateProposalModal } from "@/components/CreateProposalModal";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { execute: executeTransaction, error: voteError, clearError } = useTransactionHandler({
    showSuccessToast: false,
  });
  const { addNotification } = useNotificationContext();

  useEffect(() => blockchainEvents.subscribe((event) => {
    const incoming = (event.data.proposal ?? event.data) as Partial<Proposal>;
    const id = event.resourceId ?? incoming.id;
    if (!id) return;
    setProposals(current => current.map(proposal => proposal.id === id
      ? { ...proposal, ...incoming }
      : proposal));
  }, ['proposal.updated', 'vote.cast']), []);

  // Simulate initial loading if no proposals provided
  useEffect(() => {
    if (initialProposals.length === 0) {
      setLoading(true);
      // Simulate data fetch
      setTimeout(() => {
        setLoading(false);
        setError("No proposals available");
      }, 1000);
    }
  }, [initialProposals]);

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

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Simulate retry
    setTimeout(() => {
      setLoading(false);
      if (initialProposals.length > 0) {
        setProposals(initialProposals);
      } else {
        setError("Failed to load proposals. Please try again.");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0A0F1F] text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              {/* h1 provides page-level heading for screen readers */}
              <h1 className="text-3xl font-bold mb-2">DAO Governance</h1>
              <p className="text-gray-400">
                Participate in governance decisions and shape the future
              </p>
            </div>
            {/*
              WCAG 4.1.2 – Name, Role, Value:
              Button must have an accessible name. "New Proposal" text alone
              is sufficient; aria-label is added here to be explicit about the
              action in case the "+" prefix is misread by some screen readers.
            */}
            <button
              type="button"
              aria-label="Create a new governance proposal"
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#22BBF9] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#22BBF9]/90 transition-all w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22BBF9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F1F]"
            >
              {/* The "+" is decorative; keep it visible but screen readers will use aria-label */}
              <span aria-hidden="true">+ </span>New Proposal
            </button>
          </div>

          {/* Display vote errors */}
          {voteError && (
            <div
              className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex gap-3">
                {/* AlertCircle is decorative alongside the visible text */}
                <AlertCircle
                  className="h-6 w-6 flex-shrink-0 text-red-500"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-500">{voteError.title}</h3>
                  <p className="mt-1 text-sm text-red-400">{voteError.message}</p>
                  {voteError.remediationStep && (
                    <p className="mt-2 text-sm text-red-300">{voteError.remediationStep}</p>
                  )}
                </div>
                {/*
                  WCAG 4.1.2 – Name, Role, Value:
                  Dismiss button needs an accessible name so AT users know what it does.
                */}
                <button
                  type="button"
                  onClick={clearError}
                  aria-label="Dismiss vote error"
                  className="flex-shrink-0 text-red-400 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:rounded"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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

        {/*
          Proposals List
          aria-live="polite" so that changes (loading → loaded, filtered results)
          are announced without interrupting speech.
          WCAG 4.1.3 – Status Messages
        */}
        <div
          className="space-y-6"
          aria-live="polite"
          aria-busy={loading}
          aria-atomic="false"
        >
          {loading ? (
            // Loading state — announce to AT
            <div className="space-y-6" aria-label="Loading proposals">
              {Array.from({ length: 3 }).map((_, index) => (
                <ProposalCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            // Error state
            <ErrorState
              title="Failed to load proposals"
              description={error}
              onRetry={handleRetry}
            />
          ) : filteredProposals.length > 0 ? (
            // Proposals list
            filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onVote={handleVote}
              />
            ))
          ) : (
            // Empty state
            <EmptyState
              title="No proposals found"
              description={
                searchQuery || filter !== "all"
                  ? "Try adjusting your search or filters"
                  : "There are no active proposals at the moment"
              }
            />
          )}
        </div>
      </div>

      <CreateProposalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(proposal) => {
          setProposals((prev) => [
            {
              id: proposal.id,
              title: proposal.title,
              description: proposal.description,
              proposer: proposal.author,
              proposerName: proposal.author,
              status: "pending",
              startDate: proposal.createdAt.toISOString().slice(0, 10),
              endDate: proposal.createdAt.toISOString().slice(0, 10),
              votesFor: 0,
              votesAgainst: 0,
              votesAbstain: 0,
              totalVotes: 0,
              quorum: 10000,
              userVotingPower: 0,
              hasVoted: false,
              userVote: null,
            },
            ...prev,
          ]);
          addNotification("Proposal created successfully!", "success");
        }}
      />
    </div>
  );
}
