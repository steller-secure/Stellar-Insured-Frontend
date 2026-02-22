import { useWallet } from '@/hooks/useWallet';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { formatStellarAddress } from '@/lib/stellar';
import { CopyIcon, ExternalLinkIcon } from 'lucide-react';
import { useState } from 'react';

interface WalletStatusProps {
  showBalance?: boolean;
  showAddress?: boolean;
  compact?: boolean;
}

export function WalletStatus({ 
  showBalance = true, 
  showAddress = true, 
  compact = false 
}: WalletStatusProps) {
  const { address, isConnected, isConnecting, status } = useWallet();
  const { xlm, assets, loading: balanceLoading } = useWalletBalance();
  const [copied, setCopied] = useState(false);

  if (!isConnected) {
    return null;
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const explorerUrl = `https://stellar.expert/explorer/testnet/account/${address}`;

  // Format address based on compact mode
  const formattedAddress = compact 
    ? formatStellarAddress(address || '', 4)
    : address;

  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'} bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2`}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-300 font-medium">Connected</span>
      </div>
      
      {showAddress && address && (
        <div className="flex items-center gap-1.5">
          <span className="text-gray-200 font-mono">
            {formattedAddress}
          </span>
          <button 
            onClick={handleCopyAddress}
            className="text-gray-400 hover:text-white transition-colors p-0.5 rounded"
            title="Copy address"
          >
            {copied ? (
              <span className="text-emerald-400 text-xs">Copied!</span>
            ) : (
              <CopyIcon size={14} />
            )}
          </button>
          <a 
            href={explorerUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-0.5 rounded"
            title="View on Explorer"
          >
            <ExternalLinkIcon size={14} />
          </a>
        </div>
      )}

      {showBalance && !compact && (
        <div className="flex items-center gap-3 ml-2">
          {balanceLoading ? (
            <span className="text-gray-400 text-sm">Loading...</span>
          ) : (
            <>
              <div className="text-gray-300">
                <span className="font-mono">{xlm.toFixed(4)}</span>
                <span className="ml-1 text-xs text-gray-400">XLM</span>
              </div>
              
              {assets.length > 0 && (
                <div className="text-gray-300 text-sm">
                  {assets.slice(0, 2).map((asset, index) => (
                    <span key={`${asset.code}-${asset.issuer}`} className="mr-2 last:mr-0">
                      {asset.balance.toFixed(4)} {asset.code}
                    </span>
                  ))}
                  {assets.length > 2 && (
                    <span className="text-gray-500">+{assets.length - 2} more</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

