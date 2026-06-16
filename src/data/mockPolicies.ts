import { Policy } from "@/types/api";

export const mockPolicies: Policy[] = [
  {
    id: "1",
    name: "Crypto Asset Protection",
    type: "Travel",
    status: "active",
    coverageLimit: 75000,
    coverageLimitFormatted: "$75,000",
    premium: 120,
    expiryDate: "Apr 15, 2026",
    policyNumber: "POL-2025-001",
    description: "Comprehensive coverage for digital assets against theft, loss, and smart contract failures.",
    terms: [
      "Coverage applies to verified wallets only.",
      "Monthly premium must be paid in XLM or USDC.",
      "Claims must be filed within 48 hours of incident."
    ]
  },
  {
    id: "2",
    name: "Wallet Security Plus",
    type: "Home",
    status: "active",
    coverageLimit: 50000,
    coverageLimitFormatted: "$50,000",
    premium: 80,
    expiryDate: "Jun 10, 2026",
    policyNumber: "POL-2025-002",
    description: "Enhanced security for hardware wallets and multi-sig setups.",
    terms: [
      "Requires active 2FA on linked accounts.",
      "Covers up to 3 separate hardware devices."
    ]
  },
  {
    id: "3",
    name: "DAO Governance Insurance",
    type: "Travel",
    status: "pending",
    coverageLimit: 150000,
    coverageLimitFormatted: "$150,000",
    premium: 450,
    expiryDate: "Aug 22, 2026",
    policyNumber: "POL-2025-003",
    description: "Protection against governance manipulation and legal risks for DAO participants.",
    terms: [
      "Verification of DAO treasury required.",
      "Coverage starts after 14-day cooling period."
    ]
  },
  {
    id: "4",
    name: "Legacy Vault Protection",
    type: "Home",
    status: "expired",
    coverageLimit: 100000,
    coverageLimitFormatted: "$100,000",
    premium: 200,
    expiryDate: "Jan 01, 2025",
    policyNumber: "POL-2024-098",
    description: "Cold storage insurance for long-term holders.",
    terms: ["Bi-annual security audit required."]
  },
  {
    id: "5",
    name: "Comprehensive Health Cover",
    type: "Health",
    status: "active",
    coverageLimit: 120000,
    coverageLimitFormatted: "$120,000",
    premium: 250,
    expiryDate: "Dec 31, 2026",
    policyNumber: "POL-2025-005",
    description: "Health and medical protection for Web3 developers.",
    terms: ["Covers emergency and medical checkups."]
  },
  {
    id: "6",
    name: "Auto Collision Shield",
    type: "Auto",
    status: "active",
    coverageLimit: 60000,
    coverageLimitFormatted: "$60,000",
    premium: 140,
    expiryDate: "Oct 15, 2026",
    policyNumber: "POL-2025-006",
    description: "Auto insurance covering collision and third party liabilities.",
    terms: ["Liability coverage", "Collision shield"]
  }
];
