"use client";

import { Sidebar } from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth-provider-enhanced";
import { useState } from "react";

export default function ClaimsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { session, setSession, isAddressRegistered } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    
    const handleConnectWallet = async () => {
        if (session) return; // Already connected
        
        try {
            setIsConnecting(true);
            const { connectFreighter, createAuthMessage, signFreighterMessage } = await import("@/lib/freighter");
            const address = await connectFreighter();
            
            // Check if this address is registered
            if (!isAddressRegistered(address)) {
                // For demo purposes, we'll register the address automatically
                // In a real app, you might want to redirect to signup
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
            // Handle error - could show a toast or alert
        } finally {
            setIsConnecting(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />

            {/* Main Content Area */}
            <div className="ml-72 min-h-screen flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-slate-950/80 px-8 backdrop-blur-md">
                    <h1 className="text-xl font-bold text-white">
                        {/* Dynamic Header could go here */}
                    </h1>
                    <div className="flex items-center gap-4">
                        {session ? (
                            <div className="flex items-center gap-2 text-sm text-emerald-400">
                                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                <span>Connected: {session.address.slice(0, 6)}...{session.address.slice(-4)}</span>
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

                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
