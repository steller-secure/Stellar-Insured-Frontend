"use client";

import { Sidebar } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth-provider-enhanced";
import { useState } from "react";

export default function ClaimsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, setSession, isAddressRegistered } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = async () => {
    if (session) return;

    try {
      setIsConnecting(true);
      const { connectFreighter, createAuthMessage, signFreighterMessage } =
        await import("@/lib/freighter");
      const address = await connectFreighter();

      if (!isAddressRegistered(address)) {
        localStorage.setItem(
          `stellar_insured_users_${address}`,
          JSON.stringify({
            createdAt: Date.now(),
            email: undefined,
          })
        );
      }

      const { message } = createAuthMessage(address);
      const signed = await signFreighterMessage(address, message);

      setSession({
        address,
        signedMessage: signed.signedMessage,
        signerAddress: signed.signerAddress,
        authenticatedAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />

      <div className="ml-72 min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-slate-950/80 px-8 backdrop-blur-md">
          <h1 className="text-xl font-bold text-white" />
          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  Connected: {session.address.slice(0, 6)}...
                  {session.address.slice(-4)}
                </span>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="font-semibold"
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
