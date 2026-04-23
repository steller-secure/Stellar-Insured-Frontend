"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { useModal } from "@/hooks/useModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WalletInstallationGuide } from "@/components/WalletInstallationGuide";

type WalletStatus = "checking" | "not-installed" | "installed" | "connected";

interface WalletConnectButtonEnhancedProps {
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  showInstallGuide?: boolean;
}

/**
 * Enhanced WalletConnectButton using centralized state management
 * Demonstrates migration from local state to Zustand stores
 */
export function WalletConnectButtonEnhanced({
  disabled = false,
  className = "",
  children,
  showInstallGuide = true,
}: WalletConnectButtonEnhancedProps) {
  // Use centralized wallet state instead of local state
  const wallet = useWallet();
  
  // Use centralized modal state instead of local state
  const installGuideModal = useModal('wallet-install-guide');
  
  // Only keep truly local state (wallet detection)
  const [walletStatus, setWalletStatus] = useState<WalletStatus>("checking");

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window === "undefined") {
        setWalletStatus("checking");
        return;
      }

      try {
        // Check if Freighter is installed
        const { isConnected } = await import("@stellar/freighter-api");
        const result = await isConnected();
        
        if (result.error) {
          setWalletStatus("not-installed");
        } else if (wallet.isConnected) {
          setWalletStatus("connected");
        } else {
          setWalletStatus("installed");
        }
      } catch (error) {
        setWalletStatus("not-installed");
      }
    };

    checkWallet();
    
    // Re-check every 2 seconds in case wallet is installed/removed
    const interval = setInterval(checkWallet, 2000);
    return () => clearInterval(interval);
  }, [wallet.isConnected]);

  const handleConnect = async () => {
    if (disabled || wallet.isConnecting) return;
    
    try {
      await wallet.connectWallet();
    } catch (error) {
      wallet.handleError(
        'WALLET',
        'GENERIC_ERROR',
        error,
        { action: 'connect', component: 'WalletConnectButtonEnhanced' }
      );
    }
  };

  const handleDisconnect = () => {
    wallet.disconnect();
  };

  const getButtonContent = () => {
    // Use centralized loading state instead of local state
    if (wallet.isConnecting) {
      return (
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {wallet.status === 'signing' ? 'Confirm in Wallet...' : 'Connecting Wallet...'}
        </div>
      );
    }

    switch (walletStatus) {
      case "checking":
        return "Checking Wallet...";
      case "not-installed":
        return (
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Install Freighter Wallet
          </div>
        );
      case "installed":
        return children || "Connect Wallet";
      case "connected":
        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            {wallet.address?.slice(0, 8)}...{wallet.address?.slice(-4)}
          </div>
        );
      default:
        return children || "Connect Wallet";
    }
  };

  const getButtonVariant = () => {
    if (walletStatus === "not-installed") {
      return "outline";
    }
    if (walletStatus === "connected") {
      return "secondary";
    }
    return "primary";
  };

  const isButtonDisabled = disabled || wallet.isConnecting || walletStatus === "checking";

  const handleClick = () => {
    if (walletStatus === "connected") {
      handleDisconnect();
    } else {
      handleConnect();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={className}
      >
        {getButtonContent()}
      </Button>

      {/* Show connection error from centralized state */}
      {wallet.error && wallet.status === 'error' && (
        <Card className="bg-red-500/10 border border-red-500/20 p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-medium text-red-100 mb-1">Connection Failed</h4>
              <p className="text-sm text-red-200">{wallet.error}</p>
            </div>
          </div>
        </Card>
      )}

      {walletStatus === "not-installed" && showInstallGuide && (
        <div className="flex flex-col gap-3">
          <Card className="bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-medium text-amber-100 mb-1">Freighter Wallet Required</h4>
                <p className="text-sm text-amber-200">
                  To use this app, please install the Freighter wallet browser extension.
                </p>
                <button
                  onClick={() => installGuideModal.open()}
                  className="inline-block mt-2 text-sm font-medium text-amber-300 hover:text-amber-200 underline"
                >
                  Show Installation Guide →
                </button>
              </div>
            </div>
          </Card>
          
          {/* Use centralized modal state instead of local state */}
          {installGuideModal.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Wallet Installation Guide</h3>
                  <button
                    onClick={installGuideModal.close}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <WalletInstallationGuide />
              </div>
            </div>
          )}
        </div>
      )}

      {walletStatus === "checking" && (
        <div className="text-center text-sm text-white/60">
          Checking for wallet extension...
        </div>
      )}
    </div>
  );
}

/**
 * Migration Notes:
 * 
 * BEFORE (Local State):
 * - const [isConnecting, setIsConnecting] = useState(false);
 * - const [showInstallationGuide, setShowInstallationGuide] = useState(false);
 * - Manual error handling in try/catch
 * - Props drilling for onConnect callback
 * 
 * AFTER (Centralized State):
 * - const wallet = useWallet(); // All connection state centralized
 * - const modal = useModal('wallet-install-guide'); // Modal state centralized
 * - Automatic error handling via wallet store
 * - Direct wallet.connectWallet() call, no props needed
 * 
 * BENEFITS:
 * - 50% less local state (2 useState removed)
 * - Consistent wallet state across all components
 * - Automatic error handling and loading states
 * - Time-travel debugging via Redux DevTools
 * - Testable state mutations
 * - No prop drilling for wallet connection logic
 */