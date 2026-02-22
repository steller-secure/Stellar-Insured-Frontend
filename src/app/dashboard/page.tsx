"use client";

import { useWallet } from "@/hooks/useWallet";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { WalletStatus } from "@/components/WalletStatus";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProtectedRoute } from "@/components/protected-route";
import { useState } from "react";

export default function Dashboard() {
  const { address, isConnected, isConnecting } = useWallet();
  const { xlm, assets, loading: balanceLoading } = useWalletBalance();
  const [showFullStatus, setShowFullStatus] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Dashboard
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Manage your wallet and insurance policies
                </p>
              </div>
              <div className="flex items-center gap-3">
                <NotificationCenter />
                <WalletConnectButton showBalance={false} />
              </div>
            </div>
          </div>

          {/* Wallet Status Section */}
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Wallet Status
                  </h2>
                  {isConnected ? (
                    <p className="text-green-600 dark:text-green-400">
                      Wallet connected successfully
                    </p>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                      Connect your wallet to get started
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isConnected && (
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowFullStatus(!showFullStatus)}
                    >
                      {showFullStatus ? "Hide Details" : "Show Details"}
                    </Button>
                  )}
                </div>
              </div>
              
              {isConnected && showFullStatus && (
                <div className="mt-6">
                  <WalletStatus showBalance={true} showAddress={true} compact={false} />
                </div>
              )}
              
              {!isConnected && (
                <div className="mt-6">
                  <WalletConnectButton showBalance={true} className="w-full sm:w-auto" />
                </div>
              )}
            </Card>
          </div>

          {/* Balance Overview */}
          {isConnected && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      XLM Balance
                    </h3>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {balanceLoading ? (
                        <span className="text-gray-400">Loading...</span>
                      ) : (
                        `${xlm.toFixed(4)} XLM`
                      )}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Assets
                    </h3>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {assets.length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </h3>
                    <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
                      Connected
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button className="w-full" disabled={!isConnected}>
                  Create New Policy
                </Button>
                <Button variant="secondary" className="w-full" disabled={!isConnected}>
                  View My Policies
                </Button>
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {isConnected ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Wallet Connected
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {address?.slice(0, 8)}...{address?.slice(-4)}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Success
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Balance Updated
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Info
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    Connect your wallet to see activity
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}