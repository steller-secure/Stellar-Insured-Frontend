import { Proposal } from "@/types/dao-types";

/**
 * Calculate vote percentage for a specific vote type
 */
export const calculatePercentage = (votes: number, total: number): string => {
  if (total === 0) return "0.0";
  return ((votes / total) * 100).toFixed(1);
};

/**
 * Calculate quorum progress
 */
export const calculateQuorumProgress = (
  totalVotes: number,
  quorum: number,
): string => {
  return ((totalVotes / quorum) * 100).toFixed(1);
};

/**
 * Calculate days remaining until end date
 */
export const calculateDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Get proposal statistics
 */
export const getProposalStats = (proposals: Proposal[]) => {
  return {
    activeProposals: proposals.filter((p) => p.status === "active").length,
    votedProposals: proposals.filter((p) => p.hasVoted).length,
    totalVotingPower: proposals[0]?.userVotingPower || 0,
  };
};
