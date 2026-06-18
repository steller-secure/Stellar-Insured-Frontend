import { requestAccess, isConnected } from "@stellar/freighter-api";
import type { AuthSession } from "@/store/types";

/** Validates a Stellar public key address format (G + 55 base32 chars) */
export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address);
}

/**
 * Verifies that the session wallet address matches the currently connected
 * Freighter wallet. Returns null on match, or an error string on mismatch/failure.
 */
export async function validateSessionWallet(
  session: AuthSession
): Promise<{ valid: boolean; error?: string }> {
  try {
    const connected = await isConnected();
    if (connected.error || !connected.isConnected) {
      return { valid: false, error: "Wallet is not connected" };
    }

    const access = await requestAccess();
    if (access.error || !access.address) {
      return { valid: false, error: "Unable to retrieve connected wallet address" };
    }

    if (access.address !== session.address) {
      return {
        valid: false,
        error: `Wallet mismatch: session wallet differs from connected wallet`,
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Failed to validate wallet connection" };
  }
}

/**
 * Checks if a Stellar account has a non-zero XLM balance by querying Horizon.
 * Returns funded status and balance, or an error if account not found / request fails.
 */
export async function validateWalletFunded(
  address: string,
  horizonUrl = "https://horizon-testnet.stellar.org"
): Promise<{ funded: boolean; balance?: string; error?: string }> {
  if (!isValidStellarAddress(address)) {
    return { funded: false, error: "Invalid Stellar address" };
  }

  try {
    const res = await fetch(`${horizonUrl}/accounts/${address}`);
    if (res.status === 404) {
      return { funded: false, error: "Account not found on network (unfunded)" };
    }
    if (!res.ok) {
      return { funded: false, error: `Horizon returned ${res.status}` };
    }

    const data = await res.json();
    const nativeBalance = (data.balances as Array<{ asset_type: string; balance: string }>)
      ?.find((b) => b.asset_type === "native");

    const balance = nativeBalance?.balance ?? "0";
    const funded = parseFloat(balance) > 0;

    return { funded, balance };
  } catch {
    return { funded: false, error: "Network request to Horizon failed" };
  }
}

/** Validates all required session fields, Stellar address format, and expiry */
export function validateSessionFields(session: unknown): session is AuthSession {
  if (!session || typeof session !== "object") return false;
  const s = session as Record<string, unknown>;
  return (
    typeof s.address === "string" &&
    isValidStellarAddress(s.address) &&
    typeof s.signedMessage === "string" &&
    s.signedMessage.length > 0 &&
    typeof s.signerAddress === "string" &&
    isValidStellarAddress(s.signerAddress) &&
    typeof s.authenticatedAt === "number" &&
    typeof s.expiresAt === "number" &&
    s.expiresAt > Date.now()
  );
}
