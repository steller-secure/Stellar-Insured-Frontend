import { ConnectionStatus, AuthSession } from "@/store/types";

export interface FreighterIsConnectedResponse {
  isConnected?: boolean;
  error?: string;
}

export interface FreighterRequestAccessResponse {
  address?: string;
  error?: string;
}

export interface FreighterSignMessageResponse {
  signedMessage?: string;
  signerAddress?: string;
  error?: string;
}

export interface WalletConnectionState {
  status: ConnectionStatus;
  session: AuthSession | null;
  error: string | null;
}

export interface WalletBalanceAsset {
  code: string;
  issuer: string;
  balance: number;
}

export interface WalletBalance {
  xlm: number;
  assets: WalletBalanceAsset[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export interface UseWalletBalanceReturn extends WalletBalance {
  refetch: () => Promise<void>;
  /** Schedule a refetch after a transaction likely confirms, and briefly poll faster. */
  triggerPostTransactionRefresh: () => void;
  isPollingActive: boolean;
  pollingInterval: number;
}
