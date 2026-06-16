import {
  policySchema,
  policyCreationRequestSchema,
  claimSchema,
  claimCreationRequestSchema,
  proposalSchema,
  createProposalRequestSchema,
} from "../api";

describe("API Zod Schemas", () => {
  describe("policySchema", () => {
    it("successfully parses a valid policy", () => {
      const validPolicy = {
        id: "p1",
        name: "Comprehensive Health Plan",
        type: "Health",
        status: "active",
        coverageLimit: 50000,
        coverageLimitFormatted: "$50,000",
        policyNumber: "HEL-9928-XJ",
        premium: 250,
        expiryDate: "2025-12-31",
        description: "Comprehensive health insurance",
        terms: ["Medical expenses", "Emergency care"],
      };

      const result = policySchema.safeParse(validPolicy);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("p1");
      }
    });

    it("fails parsing if required fields are missing", () => {
      const invalidPolicy = {
        id: "p1",
        name: "Missing Type and Status",
        coverageLimit: 50000,
        coverageLimitFormatted: "$50,000",
        policyNumber: "HEL-9928-XJ",
      };

      const result = policySchema.safeParse(invalidPolicy);
      expect(result.success).toBe(false);
    });

    it("fails parsing if field values are of invalid enum type", () => {
      const invalidPolicy = {
        id: "p1",
        name: "Invalid Type Policy",
        type: "DentalCare", // Invalid type (should be Health, Auto, Home, Travel)
        status: "active",
        coverageLimit: 50000,
        coverageLimitFormatted: "$50,000",
        policyNumber: "HEL-9928-XJ",
      };

      const result = policySchema.safeParse(invalidPolicy);
      expect(result.success).toBe(false);
    });
  });

  describe("policyCreationRequestSchema", () => {
    it("successfully parses a valid policy creation request", () => {
      const request = {
        name: "New Auto Policy",
        type: "Auto",
        coverageLimit: 25000,
        description: "Auto liability",
        terms: ["Collision"],
      };

      const result = policyCreationRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it("fails if coverageLimit is less than minimum", () => {
      const request = {
        name: "Low Limit",
        type: "Auto",
        coverageLimit: 500, // minimum is 1000
      };

      const result = policyCreationRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe("claimSchema", () => {
    it("successfully parses a valid claim", () => {
      const validClaim = {
        id: "c1",
        policyId: "p1",
        policyName: "Comprehensive Health Plan",
        incidentType: "wallet-hack",
        amount: 2500,
        amountFormatted: "$2,500",
        dateFiled: "2026-06-16",
        status: "Pending",
        description: "Wallet was compromised during defi swap",
      };

      const result = claimSchema.safeParse(validClaim);
      expect(result.success).toBe(true);
    });

    it("fails if status is lowercase or invalid", () => {
      const invalidClaim = {
        id: "c1",
        policyId: "p1",
        policyName: "Comprehensive Health Plan",
        incidentType: "wallet-hack",
        amount: 2500,
        amountFormatted: "$2,500",
        dateFiled: "2026-06-16",
        status: "pending", // Schema expects capital 'Pending'
        description: "Wallet compromised",
      };

      const result = claimSchema.safeParse(invalidClaim);
      expect(result.success).toBe(false);
    });
  });

  describe("proposalSchema", () => {
    it("successfully parses a valid proposal", () => {
      const validProposal = {
        id: "prop1",
        title: "Upgrade Smart Contract v2",
        description: "Migrate the policy registry contract to v2",
        proposer: "GBX...",
        proposerName: "Alice",
        status: "active",
        startDate: "2026-06-16T12:00:00Z",
        endDate: "2026-06-23T12:00:00Z",
        votesFor: 15000,
        votesAgainst: 1200,
        votesAbstain: 300,
        totalVotes: 16500,
        quorum: 10000,
        userVotingPower: 500,
        hasVoted: true,
        userVote: "for",
      };

      const result = proposalSchema.safeParse(validProposal);
      expect(result.success).toBe(true);
    });
  });
});
