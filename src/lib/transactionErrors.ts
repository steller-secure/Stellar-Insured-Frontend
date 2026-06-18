/**
 * Transaction error type mapping for Stellar / Soroban operations.
 *
 * Covers:
 *  - Horizon API errors (op_* result codes, transaction result codes)
 *  - Soroban contract errors
 *  - Freighter / wallet errors
 *  - Network / timeout errors
 */

// ─── Error categories ────────────────────────────────────────────────────────

export type TransactionErrorCategory =
  | "INSUFFICIENT_BALANCE"   // Not enough XLM / token balance
  | "NETWORK"                // Timeout, connectivity, Horizon unavailable
  | "CONTRACT"               // Soroban smart-contract revert / panic
  | "USER_REJECTED"          // User cancelled in wallet UI
  | "WALLET"                 // Wallet not installed / not connected / signing failed
  | "TRANSACTION_FAILED"     // Stellar network rejected the transaction
  | "UNKNOWN";               // Catch-all

// ─── Structured transaction error ────────────────────────────────────────────

export interface TransactionError {
  category: TransactionErrorCategory;
  /** Short human-readable title */
  title: string;
  /** Detailed user-facing message */
  message: string;
  /** Actionable remediation step shown to the user */
  remediationStep: string;
  /** Whether the operation can be retried automatically */
  retryable: boolean;
  /** Original error for logging */
  originalError?: unknown;
}

// ─── Per-category error definitions ──────────────────────────────────────────

const ERROR_DEFINITIONS: Record<
  TransactionErrorCategory,
  Omit<TransactionError, "category" | "originalError">
> = {
  INSUFFICIENT_BALANCE: {
    title: "Insufficient Balance",
    message:
      "Your wallet does not have enough XLM to cover the transaction fee and/or the required reserve.",
    remediationStep:
      "Fund your account with XLM via an exchange or a friend's wallet, then try again.",
    retryable: false,
  },
  NETWORK: {
    title: "Network Error",
    message:
      "The request timed out or could not reach the Stellar network. This is usually temporary.",
    remediationStep:
      "Check your internet connection and try again in a few seconds.",
    retryable: true,
  },
  CONTRACT: {
    title: "Smart Contract Error",
    message:
      "The Soroban smart contract rejected the transaction. This may be due to invalid inputs or contract state.",
    remediationStep:
      "Review the transaction details. If the issue persists, contact support with the error code.",
    retryable: false,
  },
  USER_REJECTED: {
    title: "Transaction Cancelled",
    message: "You rejected the transaction in your wallet.",
    remediationStep:
      "If this was unintentional, click the action button again and approve the request in your wallet.",
    retryable: false,
  },
  WALLET: {
    title: "Wallet Error",
    message:
      "There was a problem communicating with your wallet. It may not be installed, connected, or unlocked.",
    remediationStep:
      "Ensure the Freighter extension is installed and your wallet is unlocked, then try again.",
    retryable: true,
  },
  TRANSACTION_FAILED: {
    title: "Transaction Failed",
    message:
      "The Stellar network rejected your transaction. A result code was returned by Horizon.",
    remediationStep:
      "Check the transaction details and your account status on the Stellar Explorer. Contact support if needed.",
    retryable: false,
  },
  UNKNOWN: {
    title: "Unexpected Error",
    message: "An unexpected error occurred while processing your transaction.",
    remediationStep:
      "Please try again. If the problem continues, contact support.",
    retryable: true,
  },
};

// ─── Stellar / Horizon result-code keyword maps ───────────────────────────────

const INSUFFICIENT_BALANCE_CODES = [
  "op_underfunded",
  "op_low_reserve",
  "tx_insufficient_balance",
  "tx_insufficient_fee",
  "insufficient balance",
  "insufficient funds",
  "minimum balance",
  "not enough xlm",
];

const NETWORK_ERROR_PATTERNS = [
  "timeout",
  "timed out",
  "econnreset",
  "econnrefused",
  "network error",
  "fetch failed",
  "failed to fetch",
  "connection refused",
  "horizon",
  "soroban-rpc",
  "503",
  "502",
  "504",
];

const CONTRACT_ERROR_PATTERNS = [
  "contract",
  "soroban",
  "wasm",
  "invoke_host_function",
  "op_contract_error",
  "contract_error",
  "host function",
  "diagnostic",
  "panic",
  "trap",
  "vm",
];

const USER_REJECTED_PATTERNS = [
  "user rejected",
  "user denied",
  "user cancelled",
  "user canceled",
  "rejected by user",
  "declined",
  "user did not approve",
];

const WALLET_ERROR_PATTERNS = [
  "freighter",
  "not installed",
  "not detected",
  "extension",
  "not connected",
  "wallet",
  "signing failed",
  "sign",
];

const TRANSACTION_FAILED_CODES = [
  "tx_failed",
  "tx_bad_auth",
  "tx_bad_seq",
  "tx_no_account",
  "tx_insufficient_fee",
  "op_bad_auth",
  "op_no_issuer",
  "op_no_trust",
  "op_line_full",
  "transaction failed",
  "result_codes",
];

// ─── Classifier ──────────────────────────────────────────────────────────────

/**
 * Classify any thrown value into a `TransactionError`.
 */
export function classifyTransactionError(error: unknown): TransactionError {
  const raw = normaliseErrorString(error);

  const category = detectCategory(raw, error);
  const definition = ERROR_DEFINITIONS[category];

  return {
    ...definition,
    category,
    originalError: error,
  };
}

function normaliseErrorString(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error.toLowerCase();
  if (error instanceof Error) return error.message.toLowerCase();
  if (typeof error === "object") {
    // Horizon / Soroban SDK error shapes
    const obj = error as Record<string, unknown>;
    const parts: string[] = [];
    if (typeof obj.message === "string") parts.push(obj.message);
    if (typeof obj.response === "object" && obj.response !== null) {
      const resp = obj.response as Record<string, unknown>;
      if (typeof resp.data === "object" && resp.data !== null) {
        try {
          parts.push(JSON.stringify(resp.data));
        } catch {
          // ignore
        }
      }
    }
    if (typeof obj.result_codes === "object") {
      try {
        parts.push(JSON.stringify(obj.result_codes));
      } catch {
        // ignore
      }
    }
    return parts.join(" ").toLowerCase();
  }
  return String(error).toLowerCase();
}

function detectCategory(
  raw: string,
  error: unknown,
): TransactionErrorCategory {
  if (matchesAny(raw, INSUFFICIENT_BALANCE_CODES)) return "INSUFFICIENT_BALANCE";
  if (matchesAny(raw, USER_REJECTED_PATTERNS)) return "USER_REJECTED";
  if (matchesAny(raw, CONTRACT_ERROR_PATTERNS)) return "CONTRACT";
  if (matchesAny(raw, TRANSACTION_FAILED_CODES)) return "TRANSACTION_FAILED";
  if (matchesAny(raw, NETWORK_ERROR_PATTERNS)) return "NETWORK";
  if (matchesAny(raw, WALLET_ERROR_PATTERNS)) return "WALLET";
  return "UNKNOWN";
}

function matchesAny(text: string, patterns: string[]): boolean {
  return patterns.some((p) => text.includes(p));
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

/** True when the error category is safe to retry automatically. */
export function isRetryable(error: TransactionError): boolean {
  return error.retryable;
}

/** Return a short one-line summary suitable for a toast notification. */
export function toastMessage(error: TransactionError): string {
  return `${error.title}: ${error.message}`;
}
