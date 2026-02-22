"use client";

import { Card } from "@/components/ui/Card";

export function WalletInstallationGuide() {
  return (
    <Card className="bg-slate-800/50 border border-slate-700/50 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Install Freighter Wallet</h3>
        </div>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-100 mb-1">Why Freighter?</h4>
              <p className="text-sm text-blue-200">
                Freighter is a secure, non-custodial wallet that gives you full control over your Stellar assets.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <h4 className="font-medium text-white">Installation Steps:</h4>

          <Step number={1} title="Download Extension">
            <p>Visit the official Freighter website and download the browser extension for your browser:</p>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li>• Chrome/Chromium-based browsers: Chrome Web Store</li>
              <li>• Firefox: Firefox Add-ons</li>
              <li>• Brave: Chrome Web Store</li>
            </ul>
          </Step>
          
          <Step number={2} title="Create or Import Wallet">
            <p>Open the extension and choose one of these options:</p>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li>• <strong>Create New Wallet</strong>: Generate a new wallet with a recovery phrase</li>
              <li>• <strong>Import Existing</strong>: Restore using your 12-word recovery phrase</li>
              <li>• <strong>Import with Secret Key</strong>: Use your private key (less secure)</li>
            </ul>
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-yellow-200">
                  <strong>Important:</strong> Save your recovery phrase in a secure location. Never share it with anyone.
                </p>
              </div>
            </div>
          </Step>
          
          <Step number={3} title="Fund Your Wallet">
            <p>Add XLM to your wallet to pay for transaction fees:</p>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li>• Transaction fees are typically less than 0.00001 XLM</li>
              <li>• You need a minimum balance of 1 XLM to activate your account</li>
              <li>• Buy XLM from exchanges or receive from other users</li>
            </ul>
          </Step>
          
          <Step number={4} title="Connect to Stellar Insured">
            <p>Once installed, you can connect your wallet to this application:</p>
            <ul className="mt-2 space-y-1 text-sm text-white/70">
              <li>• Click the "Connect Wallet" button above</li>
              <li>• Approve the connection in your Freighter extension</li>
              <li>• Sign authentication messages when prompted</li>
            </ul>
          </Step>
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Get Freighter Wallet
            </a>
            
            <a
              href="https://stellar.org/developers/guides/get-started/create-account.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors justify-center"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Stellar Documentation
            </a>
          </div>
        </div>
        
        <div className="pt-2">
          <details className="bg-slate-900/30 rounded-lg">
            <summary className="px-4 py-3 text-sm font-medium text-white/80 cursor-pointer hover:text-white transition-colors">
              Troubleshooting Common Issues
            </summary>
            <div className="px-4 pb-4 pt-2">
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-white text-sm mb-1">Wallet Not Detected</h5>
                  <p className="text-sm text-white/70">
                    Make sure the Freighter extension is installed and enabled in your browser. Refresh the page after installation.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-white text-sm mb-1">Connection Failed</h5>
                  <p className="text-sm text-white/70">
                    Check that your wallet is unlocked and you have approved the connection request in the extension popup.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-white text-sm mb-1">Signing Failed</h5>
                  <p className="text-sm text-white/70">
                    Ensure your wallet has sufficient XLM for transaction fees and that you haven't rejected the signing request.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-white text-sm mb-1">Still Having Issues?</h5>
                  <p className="text-sm text-white/70">
                    Check the <a href="https://github.com/stellar/freighter" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Freighter GitHub</a> for known issues or contact our support team.
                  </p>
                </div>
              </div>
            </div>
          </details>
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