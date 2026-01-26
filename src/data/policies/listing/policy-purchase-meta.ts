import { PolicyCategoryId } from "@/types/policies/policy-listing";

export type PolicyPurchaseMeta = {
  premium: string;
  duration: string;
  coverage: string;
  deductible: string;
  chain: string;
  token: string;
};

export const POLICY_PURCHASE_META_BY_ID: Record<PolicyCategoryId, PolicyPurchaseMeta> = {
  health: {
    premium: "$24.00 / mo",
    duration: "12 months",
    coverage: "$50,000 limit",
    deductible: "$250",
    chain: "Stellar",
    token: "USDC",
  },
  vehicle: {
    premium: "$39.00 / mo",
    duration: "12 months",
    coverage: "$100,000 limit",
    deductible: "$500",
    chain: "Stellar",
    token: "USDC",
  },
  property: {
    premium: "$52.00 / mo",
    duration: "12 months",
    coverage: "$250,000 limit",
    deductible: "$1,000",
    chain: "Stellar",
    token: "USDC",
  },
  travel: {
    premium: "$18.00 / trip",
    duration: "30 days",
    coverage: "$15,000 limit",
    deductible: "$0",
    chain: "Stellar",
    token: "USDC",
  },
  crypto: {
    premium: "$29.00 / mo",
    duration: "6 months",
    coverage: "$75,000 limit",
    deductible: "$0",
    chain: "Stellar",
    token: "USDC",
  },
};
