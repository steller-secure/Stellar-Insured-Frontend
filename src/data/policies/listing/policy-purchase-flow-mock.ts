import { PolicyCategoryId } from "@/types/policies/policy-listing";

export type PolicyPurchaseRequestMock = {
  premiumAmount: number;
  premiumCurrency: string;
  billingCadence: "monthly" | "per_trip";
  assetCode: string;
  assetIssuer: string;
  networkFeeXlm: number;
};

export type PolicyPurchasePayload = {
  policyId: PolicyCategoryId;
  policyTitle: string;
  planId: string;
  planName: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  premiumCurrency: string;
  billingCadence: "monthly" | "per_trip";
  duration: string;
  coverage: string;
  deductible: string;
  assetCode: string;
  assetIssuer: string;
  networkFeeXlm: number;
  walletAddress: string;
  txHash: string;
  explorerUrl: string;
  status: "success";
};

export type PolicyPurchaseSuccessMock = {
  policyNumber: string;
  startDate: string;
  endDate: string;
};

export const POLICY_PURCHASE_REQUEST_BY_ID: Record<PolicyCategoryId, PolicyPurchaseRequestMock> = {
  health: {
    premiumAmount: 24,
    premiumCurrency: "USDC",
    billingCadence: "monthly",
    assetCode: "USDC",
    assetIssuer: "GA5ZSEW7N5G2S3B3V6C4T6U7Q4A4L2D3F5G7H9J2K7M4N9P6Q2W3E8",
    networkFeeXlm: 0.15,
  },
  vehicle: {
    premiumAmount: 39,
    premiumCurrency: "USDC",
    billingCadence: "monthly",
    assetCode: "USDC",
    assetIssuer: "GA5ZSEW7N5G2S3B3V6C4T6U7Q4A4L2D3F5G7H9J2K7M4N9P6Q2W3E8",
    networkFeeXlm: 0.15,
  },
  property: {
    premiumAmount: 52,
    premiumCurrency: "USDC",
    billingCadence: "monthly",
    assetCode: "USDC",
    assetIssuer: "GA5ZSEW7N5G2S3B3V6C4T6U7Q4A4L2D3F5G7H9J2K7M4N9P6Q2W3E8",
    networkFeeXlm: 0.18,
  },
  travel: {
    premiumAmount: 18,
    premiumCurrency: "USDC",
    billingCadence: "per_trip",
    assetCode: "USDC",
    assetIssuer: "GA5ZSEW7N5G2S3B3V6C4T6U7Q4A4L2D3F5G7H9J2K7M4N9P6Q2W3E8",
    networkFeeXlm: 0.1,
  },
  crypto: {
    premiumAmount: 29,
    premiumCurrency: "USDC",
    billingCadence: "monthly",
    assetCode: "USDC",
    assetIssuer: "GA5ZSEW7N5G2S3B3V6C4T6U7Q4A4L2D3F5G7H9J2K7M4N9P6Q2W3E8",
    networkFeeXlm: 0.2,
  },
};

export const POLICY_PURCHASE_SUCCESS_BY_ID: Record<PolicyCategoryId, PolicyPurchaseSuccessMock> = {
  health: {
    policyNumber: "POL-2026-042",
    startDate: "Jan 25, 2026",
    endDate: "Jan 25, 2027",
  },
  vehicle: {
    policyNumber: "POL-2026-113",
    startDate: "Jan 25, 2026",
    endDate: "Jan 25, 2027",
  },
  property: {
    policyNumber: "POL-2026-219",
    startDate: "Jan 25, 2026",
    endDate: "Jan 25, 2027",
  },
  travel: {
    policyNumber: "POL-2026-305",
    startDate: "Jan 25, 2026",
    endDate: "Feb 24, 2026",
  },
  crypto: {
    policyNumber: "POL-2026-417",
    startDate: "Jan 25, 2026",
    endDate: "Jul 25, 2026",
  },
};

export const STELLAR_EXPLORER_TX_URL = "https://stellar.expert/explorer/testnet/tx/";

export const MOCK_WALLET_ADDRESS =
  "GAB4S6A2KQ7W4F3J8J2H9D3L5P7Q2X8V9B6N4M2R8T5Z9K9H2K7Y3P6Q";

export const MOCK_TX_HASH =
  "7F3D9A8C1B5E2F4A9D7C3E6B8A1F2D4C9E7B3A1C6D8F4E2A9B7C3D6E8F2A9C1B";
