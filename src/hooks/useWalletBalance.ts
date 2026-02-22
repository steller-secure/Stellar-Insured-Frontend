import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@/hooks/useWallet';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useNotifications } from '@/hooks/useNotifications';
import { subscribeToNetworkChanges } from '@/lib/stellar';

/**
 * Custom hook for managing wallet balance
 */
export interface WalletBalance {
  xlm: number;
  assets: Array<{
    code: string;
    issuer: string;
    balance: number;
  }>;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export function useWalletBalance() {
  const { address, isConnected } = useWallet();
  const { showBalanceUpdated, showNetworkChanged } = useNotifications();
  const [balance, setBalance] = useState<WalletBalance>({
    xlm: 0,
    assets: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });

  // Track previous balances to detect changes
  const prevXlmBalance = useRef(0);
  const prevAssets = useRef<{ code: string; issuer: string; balance: number }[]>([]);

  const fetchBalance = useCallback(async () => {
    if (!address || !isConnected) {
      setBalance(prev => ({
        ...prev,
        loading: false,
        error: !address ? 'No wallet connected' : 'Wallet not connected',
        lastUpdated: Date.now(),
      }));
      return;
    }

    setBalance(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Use testnet for now, can be configured for mainnet
      const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
      const account = await server.loadAccount(address);
      
      const xlmBalance = parseFloat(
        account.balances.find((b: any) => b.asset_type === 'native')?.balance || '0'
      );

      const assets = account.balances
        .filter((b: any) => b.asset_type !== 'native')
        .map((b: any) => ({
          code: (b as any).asset_code,
          issuer: (b as any).asset_issuer,
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

      // Show notification if balance changed
      if (xlmChanged) {
        showBalanceUpdated(xlmBalance, 'XLM');
      }

      if (assetsChanged) {
        // Show notification for asset changes
        assets.forEach((asset: { code: string; issuer: string; balance: number }) => {
          const prevAsset = prevAssets.current.find((a: { code: string; issuer: string; balance: number }) => a.code === asset.code && a.issuer === asset.issuer);
          if (!prevAsset || prevAsset.balance !== asset.balance) {
            showBalanceUpdated(asset.balance, asset.code);
          }
        });
      }
    } catch (error) {
      setBalance((prev: WalletBalance) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch balance',
        lastUpdated: Date.now(),
      }));
    }
  }, [address, isConnected]); // Removed notifications from deps to avoid circular dependency

  // Poll for balance updates
  useEffect(() => {
    if (!isConnected || !address) {
      return;
    }

    // Initial fetch
    fetchBalance();

    // Set up polling interval (every 30 seconds)
    const interval = setInterval(fetchBalance, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [isConnected, address, fetchBalance]);

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
    refetch: fetchBalance,
  };
}