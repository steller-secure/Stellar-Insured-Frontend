import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@/hooks/useWallet';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useNotifications } from '@/hooks/useNotifications';
import { subscribeToNetworkChanges } from '@/lib/stellar';
import { type WalletBalance, type WalletBalanceAsset, type UseWalletBalanceReturn } from '@/types/wallet';
import { type StellarAccountBalance } from '@/types/stellar';

// Configuration constants
const POLLING_INTERVAL_MS = 30000; // 30 seconds
const REFETCH_TIMEOUT_MS = 5000; // 5 seconds after transaction
const OPTIMIZED_POLLING_INTERVAL_MS = 10000; // 10 seconds during high activity

export function useWalletBalance(): UseWalletBalanceReturn {
  const { address, isConnected } = useWallet();
  const { showBalanceUpdated, showNetworkChanged } = useNotifications();
  const [balance, setBalance] = useState<WalletBalance>({
    xlm: 0,
    assets: [],
    loading: false,
    refreshing: false,
    error: null,
    lastUpdated: null,
  });

  // Track previous balances to detect changes
  const prevXlmBalance = useRef(0);
  const prevAssets = useRef<WalletBalanceAsset[]>([]);
  
  // Polling and activity tracking refs
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHighActivityRef = useRef(false);
  const lastTransactionTimeRef = useRef<number | null>(null);
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBalance = useCallback(async (isManualRefresh = false) => {
    if (!address || !isConnected) {
      setBalance(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: !address ? 'No wallet connected' : 'Wallet not connected',
        lastUpdated: Date.now(),
      }));
      return;
    }

    setBalance(prev => ({ 
      ...prev, 
      loading: !isManualRefresh && prev.lastUpdated === null,
      refreshing: isManualRefresh,
      error: null 
    }));

    try {
      // Use testnet for now, can be configured for mainnet
      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(address);
      
      const balances = account.balances as unknown as StellarAccountBalance[];

      const xlmBalance = parseFloat(
        balances.find((b) => b.asset_type === 'native')?.balance || '0'
      );

      const assets = balances
        .filter((b) => b.asset_type !== 'native')
        .map((b) => ({
          code: b.asset_code || '',
          issuer: b.asset_issuer || '',
          balance: parseFloat(b.balance),
        }));

      // Compare with previous balances to detect changes
      const xlmChanged = prevXlmBalance.current !== xlmBalance;
      const assetsChanged = JSON.stringify(prevAssets.current) !== JSON.stringify(assets);

      setBalance({
        xlm: xlmBalance,
        assets,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });

      // Update refs with new values
      prevXlmBalance.current = xlmBalance;
      prevAssets.current = assets;

      // Show notification if balance changed (only for manual refresh or significant changes)
      if (xlmChanged && (isManualRefresh || Math.abs(xlmBalance - prevXlmBalance.current) > 0.01)) {
        showBalanceUpdated(xlmBalance, 'XLM');
      }

      if (assetsChanged) {
        // Show notification for asset changes
        assets.forEach((asset: WalletBalanceAsset) => {
          const prevAsset = prevAssets.current.find((a: WalletBalanceAsset) => a.code === asset.code && a.issuer === asset.issuer);
          if (!prevAsset || prevAsset.balance !== asset.balance) {
            showBalanceUpdated(asset.balance, asset.code);
          }
        });
      }
    } catch (error) {
      setBalance((prev: WalletBalance) => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
        lastUpdated: Date.now(),
      }));
    }
  }, [address, isConnected, showBalanceUpdated]);

  /**
   * Trigger balance refresh after transaction
   * Automatically called when transactions are detected
   */
  const triggerPostTransactionRefresh = useCallback(() => {
    lastTransactionTimeRef.current = Date.now();
    
    // Clear any existing timeout
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }
    
    // Schedule a refetch in 5 seconds (after transaction likely confirms)
    refetchTimeoutRef.current = setTimeout(() => {
      fetchBalance();
      
      // Enable optimized polling for 2 minutes after transaction
      isHighActivityRef.current = true;
      
      // Reset to normal polling after 2 minutes
      setTimeout(() => {
        isHighActivityRef.current = false;
      }, 120000);
    }, REFETCH_TIMEOUT_MS);
  }, [fetchBalance]);

  /**
   * Manually refresh balance (called by user)
   */
  const manualRefresh = useCallback(async () => {
    await fetchBalance(true);
  }, [fetchBalance]);

  // Poll for balance updates with adaptive interval
  useEffect(() => {
    if (!isConnected || !address) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Initial fetch
    fetchBalance();

    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set up polling interval based on activity level
    const interval = isHighActivityRef.current 
      ? OPTIMIZED_POLLING_INTERVAL_MS 
      : POLLING_INTERVAL_MS;
    
    pollingIntervalRef.current = setInterval(fetchBalance, interval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isConnected, address, fetchBalance]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, []);

  // Subscribe to network changes
  useEffect(() => {
    if (!isConnected || !address) {
      return;
    }

    // Subscribe to network changes
    const unsubscribe = subscribeToNetworkChanges((newNetwork, oldNetwork) => {
      showNetworkChanged(oldNetwork, newNetwork);
      // Refetch balance after network change
      fetchBalance();
    });
    
    return unsubscribe;
  }, [isConnected, address, showNetworkChanged, fetchBalance]);

  return {
    ...balance,
    refetch: manualRefresh,
    isPollingActive: pollingIntervalRef.current !== null,
    pollingInterval: isHighActivityRef.current ? OPTIMIZED_POLLING_INTERVAL_MS : POLLING_INTERVAL_MS,
  };
}