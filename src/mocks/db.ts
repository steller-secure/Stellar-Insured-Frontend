import { Policy, Claim, Proposal } from "@/types/api";
import { v4 as uuidv4 } from "uuid";

// ─── Mock Database ────────────────────────────────────────────────────────────
// This serves as the single source of truth for mock data across the application.
// Used exclusively in development/testing via MockDataProvider.

class MockDatabase {
  private policies: Policy[];
  private claims: Claim[];
  private proposals: Proposal[];

  constructor() {
    this.policies = this.seedPolicies();
    this.claims = this.seedClaims();
    this.proposals = this.seedProposals();
  }

  // ─── Policies ───────────────────────────────────────────────────────────────

  public getPolicies(): Policy[] {
    return [...this.policies];
  }

  public getPolicy(id: string): Policy | undefined {
    return this.policies.find((p) => p.id === id);
  }

  public addPolicy(policy: Policy): void {
    this.policies.push(policy);
  }

  public updatePolicy(id: string, updates: Partial<Policy>): Policy | undefined {
    const index = this.policies.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.policies[index] = { ...this.policies[index], ...updates };
      return this.policies[index];
    }
    return undefined;
  }

  // ─── Claims ─────────────────────────────────────────────────────────────────

  public getClaims(): Claim[] {
    return [...this.claims];
  }

  public getClaim(id: string): Claim | undefined {
    return this.claims.find((c) => c.id === id);
  }

  public addClaim(claim: Claim): void {
    this.claims.push(claim);
  }

  public updateClaim(id: string, updates: Partial<Claim>): Claim | undefined {
    const index = this.claims.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.claims[index] = { ...this.claims[index], ...updates };
      return this.claims[index];
    }
    return undefined;
  }

  // ─── Proposals ──────────────────────────────────────────────────────────────

  public getProposals(): Proposal[] {
    return [...this.proposals];
  }

  public getProposal(id: string): Proposal | undefined {
    return this.proposals.find((p) => p.id === id);
  }

  public updateProposal(id: string, updates: Partial<Proposal>): Proposal | undefined {
    const index = this.proposals.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.proposals[index] = { ...this.proposals[index], ...updates };
      return this.proposals[index];
    }
    return undefined;
  }

  public addProposal(proposal: Proposal): void {
    this.proposals.push(proposal);
  }

  public deleteProposal(id: string): boolean {
    const index = this.proposals.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.proposals.splice(index, 1);
      return true;
    }
    return false;
  }

  // ─── Seed Data Methods ──────────────────────────────────────────────────────

  private seedPolicies(): Policy[] {
    return [
      {
        id: "p1",
        name: "Crypto Asset Protection",
        type: "Travel", // Originally was Travel in mockPolicies.ts
        status: "active",
        coverageLimit: 75000,
        coverageLimitFormatted: "$75,000",
        premium: 120,
        expiryDate: "2026-04-15",
        policyNumber: "POL-2025-001",
        description: "Comprehensive coverage for digital assets against theft, loss, and smart contract failures.",
        terms: [
          "Coverage applies to verified wallets only.",
          "Monthly premium must be paid in XLM or USDC.",
          "Claims must be filed within 48 hours of incident."
        ],
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01"
      },
      {
        id: "p2",
        name: "Wallet Security Plus",
        type: "Home",
        status: "active",
        coverageLimit: 50000,
        coverageLimitFormatted: "$50,000",
        premium: 80,
        expiryDate: "2026-06-10",
        policyNumber: "POL-2025-002",
        description: "Enhanced security for hardware wallets and multi-sig setups.",
        terms: [
          "Requires active 2FA on linked accounts.",
          "Covers up to 3 separate hardware devices."
        ],
        createdAt: "2025-02-15",
        updatedAt: "2025-02-15"
      },
      {
        id: "p3",
        name: "DAO Governance Insurance",
        type: "Travel",
        status: "pending",
        coverageLimit: 150000,
        coverageLimitFormatted: "$150,000",
        premium: 450,
        expiryDate: "2026-08-22",
        policyNumber: "POL-2025-003",
        description: "Protection against governance manipulation and legal risks for DAO participants.",
        terms: [
          "Verification of DAO treasury required.",
          "Coverage starts after 14-day cooling period."
        ],
        createdAt: "2025-03-20",
        updatedAt: "2025-03-20"
      },
      {
        id: "p4",
        name: "Legacy Vault Protection",
        type: "Home",
        status: "expired",
        coverageLimit: 100000,
        coverageLimitFormatted: "$100,000",
        premium: 200,
        expiryDate: "2025-01-01",
        policyNumber: "POL-2024-098",
        description: "Cold storage insurance for long-term holders.",
        terms: ["Bi-annual security audit required."],
        createdAt: "2024-06-01",
        updatedAt: "2024-06-01"
      },
      {
        id: "p5",
        name: "Comprehensive Health Cover",
        type: "Health",
        status: "active",
        coverageLimit: 120000,
        coverageLimitFormatted: "$120,000",
        premium: 250,
        expiryDate: "2026-12-31",
        policyNumber: "POL-2025-005",
        description: "Health and medical protection for Web3 developers.",
        terms: ["Covers emergency and medical checkups."],
        createdAt: "2025-04-10",
        updatedAt: "2025-04-10"
      },
      {
        id: "p6",
        name: "Auto Collision Shield",
        type: "Auto",
        status: "active",
        coverageLimit: 60000,
        coverageLimitFormatted: "$60,000",
        premium: 140,
        expiryDate: "2026-10-15",
        policyNumber: "POL-2025-006",
        description: "Auto insurance covering collision and third party liabilities.",
        terms: ["Liability coverage", "Collision shield"],
        createdAt: "2025-05-05",
        updatedAt: "2025-05-05"
      }
    ];
  }

  private seedClaims(): Claim[] {
    return [
      {
        id: 'CLM-2025-001',
        policyId: 'p1',
        policyName: 'Crypto Asset Protection',
        incidentType: 'Wallet Hack Compensation',
        amount: 12500,
        amountFormatted: '$12,500',
        dateFiled: '2025-04-02',
        status: 'Active',
        description: 'Compensation for assets lost during exchange security breach',
      },
      {
        id: 'CLM-2025-002',
        policyId: 'p2',
        policyName: 'Wallet Security Plus',
        incidentType: 'Smart Contract Claim',
        amount: 8000,
        amountFormatted: '$8,000',
        dateFiled: '2025-04-15',
        status: 'Pending',
        description: 'Claim for losses due to smart contract vulnerability exploit',
      },
      {
        id: 'CLM-2025-003',
        policyId: 'p3',
        policyName: 'DAO Governance Insurance',
        incidentType: 'DeFi Protocol Hack',
        amount: 15000,
        amountFormatted: '$15,000',
        dateFiled: '2025-03-28',
        status: 'Rejected',
        description: 'Compensation request for DeFi protocol security incident',
      },
    ];
  }

  private seedProposals(): Proposal[] {
    return [
      {
        id: "PROP-2026-001",
        title: "Increase Coverage Limits for Crypto Asset Protection",
        description: "Proposal to increase the maximum coverage limit from $75,000 to $150,000 for crypto asset protection policies to better serve high-value asset holders.",
        proposer: "0x742d...8f3a",
        proposerName: "Alice Chen",
        status: "active",
        startDate: "2026-01-20",
        endDate: "2026-01-30",
        votesFor: 12450,
        votesAgainst: 3200,
        votesAbstain: 1500,
        totalVotes: 17150,
        quorum: 10000,
        userVotingPower: 250,
        hasVoted: false,
        userVote: null,
      },
      {
        id: "PROP-2026-002",
        title: "Implement Multi-Chain Support for DeFi Coverage",
        description: "Expand insurance coverage to include Ethereum, Polygon, and Arbitrum chains in addition to current Stellar support.",
        proposer: "0x893c...2d4b",
        proposerName: "Bob Kumar",
        status: "active",
        startDate: "2026-01-22",
        endDate: "2026-02-01",
        votesFor: 8900,
        votesAgainst: 2100,
        votesAbstain: 800,
        totalVotes: 11800,
        quorum: 10000,
        userVotingPower: 250,
        hasVoted: true,
        userVote: "for",
      },
      {
        id: "PROP-2026-003",
        title: "Reduce Premium Fees by 15% for Long-term Policies",
        description: "Introduce a discount structure for policies held longer than 12 months to incentivize long-term participation.",
        proposer: "0x1f5e...9c7d",
        proposerName: "Carol Zhang",
        status: "active",
        startDate: "2026-01-24",
        endDate: "2026-02-03",
        votesFor: 15600,
        votesAgainst: 4200,
        votesAbstain: 2100,
        totalVotes: 21900,
        quorum: 10000,
        userVotingPower: 250,
        hasVoted: false,
        userVote: null,
      },
    ];
  }
}

// Export singleton instance
export const mockDb = new MockDatabase();
