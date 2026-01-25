import { Policy } from "@/types/policy";

export const mockPolicies: Policy[] = [
  {
    id: "1",
    name: "Crypto Asset Protection",
    status: "active",
    coverage: 75000,
    premium: 120,
    expiryDate: "Apr 15, 2026",
    policyId: "POL-2025-001",
    description:
      "Comprehensive coverage for digital assets against theft, loss, and smart contract failures.",
    terms: [
      "Coverage applies to verified wallets only.",
      "Monthly premium must be paid in XLM or USDC.",
      "Claims must be filed within 48 hours of incident.",
    ],
  },
  {
    id: "2",
    name: "Wallet Security Plus",
    status: "active",
    coverage: 50000,
    premium: 80,
    expiryDate: "Jun 10, 2026",
    policyId: "POL-2025-002",
    description: "Enhanced security for hardware wallets and multi-sig setups.",
    terms: [
      "Requires active 2FA on linked accounts.",
      "Covers up to 3 separate hardware devices.",
    ],
  },
  {
    id: "3",
    name: "DAO Governance Insurance",
    status: "pending",
    coverage: 150000,
    premium: 450,
    expiryDate: "Aug 22, 2026",
    policyId: "POL-2025-003",
    description:
      "Protection against governance manipulation and legal risks for DAO participants.",
    terms: [
      "Verification of DAO treasury required.",
      "Coverage starts after 14-day cooling period.",
    ],
  },
  {
    id: "4",
    name: "Legacy Vault Protection",
    status: "expired",
    coverage: 100000,
    premium: 200,
    expiryDate: "Jan 01, 2025",
    policyId: "POL-2024-098",
    description: "Cold storage insurance for long-term holders.",
    terms: ["Bi-annual security audit required."],
  },
];
