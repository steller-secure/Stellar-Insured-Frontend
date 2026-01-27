export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  proposerName: string;
  status: "active" | "pending" | "expired";
  startDate: string;
  endDate: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  quorum: number;
  userVotingPower: number;
  hasVoted: boolean;
  userVote: "for" | "against" | "abstain" | null;
}

export type VoteType = "for" | "against" | "abstain";

export interface ProposalStats {
  activeProposals: number;
  votedProposals: number;
  totalVotingPower: number;
}
