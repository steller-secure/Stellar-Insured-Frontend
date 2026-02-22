"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WalletInstallationGuide } from "@/components/WalletInstallationGuide";
import { useWallet } from "@/hooks/useWallet";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useNotifications } from "@/hooks/useNotifications";
import { formatStellarAddress } from "@/lib/stellar";
import { FeedbackState } from "@/components/ui/FeedbackState";

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
  const { 
    connectWallet, 
    disconnect, 
    reconnectWallet,
    address, 
    isConnected, 
    status: connectionStatus, 
    error,
    hasError,
    canRetry,
    handleError,
    showErrorNotification
  } = useWallet();
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
        const result = await connectWallet();
        if (result && onConnect) {
          await onConnect();
        }
      }
    } catch (err) {
      console.error('Wallet operation failed:', err);
      // Error is already handled by the useWallet hook
    }
  };

  const handleRetry = async () => {
    try {
      const result = await reconnectWallet();
      if (result && onConnect) {
        await onConnect();
      }
    } catch (err) {
      console.error('Wallet retry failed:', err);
      // Error is already handled by the useWallet hook
    }
  };

  const handleInstallClick = () => {
    setShowInstallationGuide(true);
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

  const getErrorInfo = () => {
    if (!error) return { code: 'UNKNOWN', suggestion: '' };
    
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('not found') || errorLower.includes('not detected')) {
      return {
        code: 'WALLET_NOT_INSTALLED',
        suggestion: 'Please install the Freighter wallet browser extension and refresh the page.'
      };
    }
    
    if (errorLower.includes('rejected') || errorLower.includes('denied')) {
      return {
        code: 'USER_REJECTED',
        suggestion: 'You cancelled the connection. Please try again if you wish to proceed.'
      };
    }
    
    if (errorLower.includes('sign')) {
      return {
        code: 'SIGNING_FAILED',
        suggestion: 'Failed to sign the transaction. Please check your wallet settings and try again.'
      };
    }
    
    return {
      code: 'WALLET_ERROR',
      suggestion: 'An error occurred while connecting to your wallet. Please try again.'
    };
  };

  const isButtonDisabled = disabled || connectionStatus === 'connecting' || connectionStatus === 'signing';

  const errorInfo = getErrorInfo();
  
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
          <FeedbackState
            variant="error"
            title="Wallet Connection Error"
            description={error}
            errorCode={errorInfo.code}
            recoverySuggestion={errorInfo.suggestion}
            actionLabel={errorInfo.code === 'WALLET_NOT_INSTALLED' ? "Install Wallet" : undefined}
            onAction={errorInfo.code === 'WALLET_NOT_INSTALLED' ? handleInstallClick : undefined}
            showRetryButton={canRetry}
            onRetry={handleRetry}
            retryCount={hasError ? 1 : 0}
            maxRetries={3}
          />
          
          {showInstallationGuide && (
            <Card className="bg-slate-800/50 border border-slate-700/50 p-4">
              <WalletInstallationGuide />
              <div className="mt-4 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowInstallationGuide(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => {
                    setShowInstallationGuide(false);
                    window.open('https://www.freighter.app/', '_blank');
                  }}
                >
                  Go to Freighter
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}