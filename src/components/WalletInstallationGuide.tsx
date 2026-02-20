"use client";

import { Card } from "@/components/ui/Card";

export function WalletInstallationGuide() {
  return (
    <Card className="bg-slate-800/50 border border-slate-700/50 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Install Freighter Wallet</h3>
        </div>
        
        <p className="text-white/80 text-sm">
          Freighter is a secure browser extension wallet for the Stellar network. 
          Follow these steps to get started:
        </p>

        <div className="flex flex-col gap-4 mt-2">
          <Step number={1} title="Download Extension">
            Visit the official Freighter website and download the browser extension for Chrome, Firefox, or Brave.
          </Step>
          
          <Step number={2} title="Create or Import Wallet">
            Open the extension and either create a new wallet or import an existing one using your secret key.
          </Step>
          
          <Step number={3} title="Fund Your Wallet">
            Add XLM to your wallet to pay for transaction fees (typically less than 0.00001 XLM per transaction).
          </Step>
          
          <Step number={4} title="Refresh This Page">
            Once installed, refresh this page and you&apos;ll be able to connect your wallet.
          </Step>
        </div>

        <div className="pt-4 border-t border-white/10">
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Get Freighter Wallet
          </a>
        </div>
      </div>
    </Card>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-white mb-1">{title}</h4>
        <p className="text-white/70 text-sm">{children}</p>
      </div>
    </div>
  );
}