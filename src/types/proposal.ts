export type ProposalType = "UPGRADE" | "FUNDING" | "PARAMETER_CHANGE";

export type ProposalStatus = "PENDING" | "ACTIVE" | "APPROVED" | "REJECTED";

export interface Proposal {
  id: string;
  title: string;
  description: string;
  type: ProposalType;
  status: ProposalStatus;
  author: string;
  createdAt: Date;
  updatedAt: Date;
}
