export type PolicyStatus = "active" | "pending" | "expired";

export interface Policy {
  id: string;
  name: string;
  status: PolicyStatus;
  coverage: number;
  premium: number;
  expiryDate: string;
  policyId: string;
  description: string;
  terms: string[];
}
