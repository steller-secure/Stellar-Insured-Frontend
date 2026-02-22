"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/components/auth-provider-enhanced";
import { useWallet } from "@/hooks/useWallet";
import { ClaimTrackingDashboard } from "@/components/claims/ClaimTrackingDashboard";
import { WalletStatus } from "@/components/WalletStatus";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { connectFreighter, createAuthMessage, signFreighterMessage } from "@/lib/freighter";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function ClaimsPage() {
  const { trackAction } = useAnalytics();
  const { session, setSession, isAddressRegistered } = useAuth();
  const { isConnected, isConnecting } = useWallet();
  const [isConnectingLocal, setIsConnectingLocal] = useState(false);

  const handleConnectWallet = async () => {
    if (session) return; // Already connected

    try {
      setIsConnectingLocal(true);
      const address = await connectFreighter();

      // Check if this address is registered
      if (!isAddressRegistered(address)) {
        // For demo purposes, we'll register the address automatically
        localStorage.setItem(`stellar_insured_users_${address}`, JSON.stringify({
          createdAt: Date.now(),
          email: undefined
        }));
      }

      const { message } = createAuthMessage(address);
      const signed = await signFreighterMessage(address, message);

      setSession({
        address,
        signedMessage: signed.signedMessage,
        signerAddress: signed.signerAddress,
        authenticatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnectingLocal(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">Claims Dashboard</h1>
            <p className="text-gray-400">
              Manage and track your insurance claims
            </p>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-3">
                <WalletStatus showBalance={true} showAddress={false} compact={true} />
                <WalletConnectButton showBalance={false} />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConnectWallet}
                  disabled={isConnectingLocal}
                  className="font-semibold flex items-center gap-2"
                >
                  {isConnectingLocal && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isConnectingLocal ? "Connecting..." : "Connect Wallet"}
                </Button>
              </div>
            )}
            <Link href="/claims/new" onClick={() => trackAction("CLAIM", "CLAIM_STARTED")}>
              <Button variant="primary" disabled={!isConnected}>
                <Plus className="mr-2 h-4 w-4" />
                New Claim
              </Button>
            </Link>
          </div>
        </div>

        {/* Claim Tracking Dashboard */}
        <ClaimTrackingDashboard />
      </div>
    </ProtectedRoute>
  );
}