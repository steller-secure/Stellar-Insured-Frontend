import { z } from "zod";

// ─── Pagination Envelopes ───────────────────────────────────────────────────

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    totalCount: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });
}

// ─── Policy Schemas & Types ──────────────────────────────────────────────────

export const policyStatusSchema = z.enum(["active", "pending", "expired"]);
export type PolicyStatus = z.infer<typeof policyStatusSchema>;

export const policyTypeSchema = z.enum(["Health", "Auto", "Home", "Travel"]);
export type PolicyType = z.infer<typeof policyTypeSchema>;

export const policySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: policyTypeSchema,
  status: policyStatusSchema,
  coverageLimit: z.number(),
  coverageLimitFormatted: z.string(),
  policyNumber: z.string(),
  premium: z.number().optional(),
  expiryDate: z.string().optional(),
  description: z.string().optional(),
  terms: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Policy = z.infer<typeof policySchema>;

export const policyCreationRequestSchema = z.object({
  name: z.string().min(3, "Policy name must be at least 3 characters"),
  type: policyTypeSchema,
  coverageLimit: z.number().min(1000).max(10000000),
  description: z.string().optional(),
  terms: z.array(z.string()).optional(),
});
export type PolicyCreationRequest = z.infer<typeof policyCreationRequestSchema>;

export const policyUpdateRequestSchema = policyCreationRequestSchema.partial().extend({
  status: policyStatusSchema.optional(),
});
export type PolicyUpdateRequest = z.infer<typeof policyUpdateRequestSchema>;

export const premiumCalculationRequestSchema = z.object({
  policyType: policyTypeSchema,
  coverageLimit: z.number().min(1000),
  riskFactors: z.object({
    age: z.number().optional(),
    location: z.string().optional(),
    claimsHistory: z.number().optional(),
    creditScore: z.number().optional(),
  }).optional(),
});
export type PremiumCalculationRequest = z.infer<typeof premiumCalculationRequestSchema>;

export const premiumCalculationResultSchema = z.object({
  basePremium: z.number(),
  finalPremium: z.number(),
  riskMultiplier: z.number(),
  breakdown: z.object({
    coverageComponent: z.number(),
    riskComponent: z.number(),
    fees: z.number(),
  }),
});
export type PremiumCalculationResult = z.infer<typeof premiumCalculationResultSchema>;

export const policyStatsSchema = z.object({
  totalPolicies: z.number(),
  activePolicies: z.number(),
  totalCoverage: z.number(),
  averagePremium: z.number(),
});
export type PolicyStats = z.infer<typeof policyStatsSchema>;

export const paginatedPolicySchema = createPaginatedResponseSchema(policySchema);
export type PaginatedPolicyResponse = z.infer<typeof paginatedPolicySchema>;

// ─── Claim Schemas & Types ───────────────────────────────────────────────────

export const claimStatusSchema = z.enum(["Active", "Pending", "Approved", "Rejected"]);
export type ClaimStatus = z.infer<typeof claimStatusSchema>;

export const claimSchema = z.object({
  id: z.string(),
  policyId: z.string(),
  policyName: z.string(),
  incidentType: z.string(),
  amount: z.number(),
  amountFormatted: z.string(),
  dateFiled: z.string(),
  status: claimStatusSchema,
  description: z.string(),
  evidence: z.array(z.string()).optional(),
  walletAddress: z.string().optional(),
});
export type Claim = z.infer<typeof claimSchema>;

export const claimCreationRequestSchema = z.object({
  policyId: z.string(),
  incidentType: z.string(),
  amount: z.number().positive(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  evidence: z.array(z.string()).optional(),
  walletAddress: z.string().optional(),
});
export type ClaimCreationRequest = z.infer<typeof claimCreationRequestSchema>;

export const claimUpdateRequestSchema = z.object({
  status: claimStatusSchema.optional(),
  description: z.string().optional(),
  evidence: z.array(z.string()).optional(),
});
export type ClaimUpdateRequest = z.infer<typeof claimUpdateRequestSchema>;

export const claimStatsSchema = z.object({
  totalClaims: z.number(),
  pendingClaims: z.number(),
  approvedClaims: z.number(),
  totalClaimedAmount: z.number(),
});
export type ClaimStats = z.infer<typeof claimStatsSchema>;

export const paginatedClaimSchema = createPaginatedResponseSchema(claimSchema);
export type PaginatedClaimResponse = z.infer<typeof paginatedClaimSchema>;

// ─── DAO Governance Schemas & Types ──────────────────────────────────────────

export const proposalStatusSchema = z.enum(["active", "pending", "expired"]);
export type ProposalStatus = z.infer<typeof proposalStatusSchema>;

export const voteTypeSchema = z.enum(["for", "against", "abstain"]);
export type VoteType = z.infer<typeof voteTypeSchema>;

export const proposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  proposer: z.string(),
  proposerName: z.string(),
  status: proposalStatusSchema,
  startDate: z.string(),
  endDate: z.string(),
  votesFor: z.number(),
  votesAgainst: z.number(),
  votesAbstain: z.number(),
  totalVotes: z.number(),
  quorum: z.number(),
  userVotingPower: z.number(),
  hasVoted: z.boolean(),
  userVote: voteTypeSchema.nullable(),
});
export type Proposal = z.infer<typeof proposalSchema>;

export const createProposalRequestSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.string(),
  endDate: z.string(),
});
export type CreateProposalRequest = z.infer<typeof createProposalRequestSchema>;

export const castVoteResponseSchema = z.object({
  success: z.boolean(),
  updatedProposal: proposalSchema,
});
export type CastVoteResponse = z.infer<typeof castVoteResponseSchema>;

export const daoStatsSchema = z.object({
  activeProposals: z.number(),
  votedProposals: z.number(),
  totalVotingPower: z.number(),
});
export type DaoStats = z.infer<typeof daoStatsSchema>;

export const paginatedProposalSchema = createPaginatedResponseSchema(proposalSchema);
export type PaginatedProposalResponse = z.infer<typeof paginatedProposalSchema>;
