import { z } from "zod";
import {
  walletBalanceSchema,
  authSessionSchema,
  type WalletBalance,
  type WalletBalanceAsset,
  type WalletBalanceResponse,
} from "./api";

// Re-export derived types
export type { WalletBalance, WalletBalanceAsset, WalletBalanceResponse };

// Zod schemas for wallet connection state
export const walletConnectionStateSchema = z.object({
  status: z.enum(["idle", "connecting", "connected", "error", "signing"]),
  session: authSessionSchema.nullable(),
  error: z.string().nullable(),
});
export type WalletConnectionState = z.infer<typeof walletConnectionStateSchema>;

// Freighter response schemas
export const freighterIsConnectedResponseSchema = z.object({
  isConnected: z.boolean().optional(),
  error: z.string().optional(),
});
export type FreighterIsConnectedResponse = z.infer<typeof freighterIsConnectedResponseSchema>;

export const freighterRequestAccessResponseSchema = z.object({
  address: z.string().optional(),
  error: z.string().optional(),
});
export type FreighterRequestAccessResponse = z.infer<typeof freighterRequestAccessResponseSchema>;

export const freighterSignMessageResponseSchema = z.object({
  signedMessage: z.string().optional(),
  signerAddress: z.string().optional(),
  error: z.string().optional(),
});
export type FreighterSignMessageResponse = z.infer<typeof freighterSignMessageResponseSchema>;

// UseWalletBalanceReturn extends WalletBalance with additional methods
export interface UseWalletBalanceReturn extends WalletBalance {
  refetch: () => Promise<void>;
  /** Schedule a refetch after a transaction likely confirms, and briefly poll faster. */
  triggerPostTransactionRefresh: () => void;
  isPollingActive: boolean;
  pollingInterval: number;
}