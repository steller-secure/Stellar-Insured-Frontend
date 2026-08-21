import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@/hooks/useWallet';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useNotifications } from '@/hooks/useNotifications';
import { subscribeToNetworkChanges } from '@/lib/stellar';
import { type WalletBalanceAsset, type UseWalletBalanceReturn } from '@/types/wallet';
import { type StellarAccountBalance } from '@/types/stellar';
import { blockchainEvents, type ConnectionMode } from '@/lib/blockchainEvents';
import { queryKeys } from '@/hooks/queries/queryKeys';

// Configuration constants
const POLLING_INTERVAL_MS = 30000; // 30 seconds
const OPTIMIZED_POLLING_INTERVAL_MS = 10000; // 10 seconds during high activity

interface BalanceData {
  xlm: number;
  assets: WalletBalanceAsset[];
}

async function fetchBalance(address: string): Promise<BalanceData> {
  // Use testnet for now, can be configured for mainnet
  const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(address);

  const balances = account.balances as unknown as StellarAccountBalance[];

  const xlm = parseFloat(
    balances.find((b) => b.asset_type === 'native')?.balance || '0'
  );

  const assets = balances
    .filter((b) => b.asset_type !== 'native')
    .map((b) => ({
      code: b.asset_code || '',
      issuer: b.asset_issuer || '',
      balance: parseFloat(b.balance),
    }));

  return { xlm, assets };
}

/**
 * Wallet balance, backed by React Query. Real-time updates come from the
 * global blockchainEvents -> query-invalidation bridge (see
 * useBlockchainQuerySync); polling here is only a low-frequency safety net
 * when no real-time transport is connected, mirroring the connection-mode
 * behavior blockchainEvents already exposes.
 */
export function useWalletBalance(): UseWalletBalanceReturn {
  const { address, isConnected } = useWallet();
  const { showBalanceUpdated, showNetworkChanged } = useNotifications();

  // Track previous balances to detect changes for notifications
  const prevXlmBalance = useRef(0);
  const prevAssets = useRef<WalletBalanceAsset[]>([]);
  const refetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highActivityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isHighActivity, setIsHighActivity] = useState(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('disconnected');

  useEffect(
    () => blockchainEvents.subscribeToState((state) => setConnectionMode(state.mode)),
    []
  );

  const isPollingActive = connectionMode === 'disconnected' || connectionMode === 'polling';
  const pollingInterval = isHighActivity ? OPTIMIZED_POLLING_INTERVAL_MS : POLLING_INTERVAL_MS;

  const query = useQuery({
    queryKey: queryKeys.wallet.balance(address),
    queryFn: () => fetchBalance(address as string),
    enabled: isConnected && !!address,
    refetchInterval: isPollingActive ? pollingInterval : false,
  });

  // Notify on balance changes (mirrors the previous hook's diffing logic).
  useEffect(() => {
    if (!query.data) return;
    const { xlm, assets } = query.data;

    const xlmChanged = prevXlmBalance.current !== xlm;
    if (xlmChanged && Math.abs(xlm - prevXlmBalance.current) > 0.01) {
      showBalanceUpdated(xlm, 'XLM');
    }

    assets.forEach((asset) => {
      const prevAsset = prevAssets.current.find(
        (a) => a.code === asset.code && a.issuer === asset.issuer
      );
      if (!prevAsset || prevAsset.balance !== asset.balance) {
        showBalanceUpdated(asset.balance, asset.code);
      }
    });

    prevXlmBalance.current = xlm;
    prevAssets.current = assets;
  }, [query.data, showBalanceUpdated]);

  /**
   * Trigger balance refresh after transaction. Automatically called when
   * transactions are detected.
   */
  const triggerPostTransactionRefresh = useCallback(() => {
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }

    if (highActivityTimeoutRef.current) {
      clearTimeout(highActivityTimeoutRef.current);
    }

    // Schedule a refetch in 5 seconds (after transaction likely confirms)
    refetchTimeoutRef.current = setTimeout(() => {
      void query.refetch();

      // Enable optimized polling for 2 minutes after transaction
      setIsHighActivity(true);
      highActivityTimeoutRef.current = setTimeout(() => {
        setIsHighActivity(false);
      }, 120000);
    }, 5000);
  }, [query]);

  const manualRefresh = useCallback(async () => {
    setIsManualRefreshing(true);
    try {
      await query.refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }, [query]);

  // Clean up pending timeouts on unmount.
  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
      if (highActivityTimeoutRef.current) {
        clearTimeout(highActivityTimeoutRef.current);
      }
    };
  }, []);

  // Subscribe to network changes
  useEffect(() => {
    if (!isConnected || !address) {
      return;
    }

    const unsubscribe = subscribeToNetworkChanges((newNetwork, oldNetwork) => {
      showNetworkChanged(oldNetwork, newNetwork);
      void query.refetch();
    });

    return unsubscribe;
  }, [isConnected, address, showNetworkChanged, query]);

  return {
    xlm: query.data?.xlm ?? 0,
    assets: query.data?.assets ?? [],
    loading: query.isLoading,
    refreshing: isManualRefreshing,
    error: !address
      ? 'No wallet connected'
      : !isConnected
        ? 'Wallet not connected'
        : query.error instanceof Error
          ? query.error.message
          : null,
    lastUpdated: query.dataUpdatedAt || null,
    refetch: manualRefresh,
    triggerPostTransactionRefresh,
    isPollingActive,
    pollingInterval,
  };
}

