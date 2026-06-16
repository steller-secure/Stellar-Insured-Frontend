/**
 * Type definitions for Stellar SDK integrations.
 */

export interface StellarAccountBalance {
  asset_type: "native" | "credit_alphanum4" | "credit_alphanum12" | "liquidity_pool_shares";
  balance: string;
  limit?: string;
  buying_liabilities?: string;
  selling_liabilities?: string;
  asset_code?: string;
  asset_issuer?: string;
}

export interface StellarAccount {
  id: string;
  account_id: string;
  sequence: string;
  balances: StellarAccountBalance[];
  subentry_count: number;
}

export interface StellarTransaction {
  id: string;
  hash: string;
  ledger: number;
  created_at: string;
  source_account: string;
  source_account_sequence: string;
  fee_paid: number;
  fee_charged: number;
  max_fee: number;
  operation_count: number;
  memo?: string;
  memo_type?: string;
  signatures: string[];
  successful: boolean;
}

export interface ContractInvocation {
  contractId: string;
  functionName: string;
  args: unknown[];
  fee?: string;
  sourceAccount?: string;
}
