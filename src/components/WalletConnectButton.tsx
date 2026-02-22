"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WalletInstallationGuide } from "@/components/WalletInstallationGuide";
import { useWallet } from "@/hooks/useWallet";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useNotifications } from "@/hooks/useNotifications";
import { formatStellarAddress } from "@/lib/stellar";

type WalletStatus = "checking" | "not-installed" | "installed" | "connected";

interface WalletConnectButtonProps {
  onConnect?: () => Promise<void>;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  showBalance?: boolean;
}

export function WalletConnectButton({
  onConnect,
  disabled = false,
  className = "",
  children,
  showBalance = true,
}: WalletConnectButtonProps) {
  const { connectWallet, disconnect, address, isConnected, status: connectionStatus, error } = useWallet();
  const { xlm, loading: balanceLoading } = useWalletBalance();
  const { showWalletConnected, showWalletDisconnected, showWalletError } = useNotifications();
  const [showInstallationGuide, setShowInstallationGuide] = useState(false);
  
  // Handle wallet connection status changes
  useEffect(() => {
    if (isConnected && address) {
      showWalletConnected(address);
    }
  }, [isConnected, address, showWalletConnected]);
  
  useEffect(() => {
    if (error) {
      showWalletError(error);
    }
  }, [error, showWalletError]);

  // Remove the old effect that checked wallet status manually since we're using the centralized store
  // The status is now handled by the useWallet hook

  const handleClick = async () => {
    if (disabled) return;
    
    try {
      if (isConnected) {
        disconnect();
        showWalletDisconnected();
      } else {
        await connectWallet();
        if (onConnect) {
          await onConnect();
        }
      }
    } catch (err) {
      console.error('Wallet operation failed:', err);
    }
  };

  const getButtonContent = () => {
    if (connectionStatus === 'connecting' || connectionStatus === 'signing') {
      return (
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {connectionStatus === 'signing' ? 'Signing...' : 'Connecting...'}
        </div>
      );
    }

    if (isConnected && address) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-mono">{formatStellarAddress(address, 4)}</span>
            {showBalance && (
              <span className="text-xs text-gray-400">
                {balanceLoading ? '...' : `${xlm.toFixed(2)} XLM`}
              </span>
            )}
          </div>
        </div>
      );
    }

    return children || "Connect Wallet";
  };

  const getButtonVariant = () => {
    if (connectionStatus === 'error') {
      return "danger";
    }
    if (isConnected) {
      return "secondary";
    }
    return "primary";
  };

  const isButtonDisabled = disabled || connectionStatus === 'connecting' || connectionStatus === 'signing';

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={handleClick}
        disabled={isButtonDisabled}
        variant={getButtonVariant()}
        className={className}
      >
        {getButtonContent()}
      </Button>

      {connectionStatus === 'error' && error && (
        <div className="flex flex-col gap-3">
          <Card className="bg-red-500/10 border border-red-500/20 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-medium text-red-100 mb-1">Connection Error</h4>
                <p className="text-sm text-red-200">
                  {error}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}