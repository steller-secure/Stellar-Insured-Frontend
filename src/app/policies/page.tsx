"use client";

import React, { useMemo, useState } from "react";
import { PolicyCard } from "@/components/policies/PolicyCard";
import { mockPolicies } from "@/data/mockPolicies";
import { Search, Plus } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import { FilterDropdown } from "@/components/FilterDropdown";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useWallet } from "@/hooks/useWallet";
import { WalletStatus } from "@/components/WalletStatus";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { ProtectedRoute } from "@/components/protected-route";

export default function PoliciesPage() {
  const { trackAction } = useAnalytics();
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const itemsPerPage = 9;

  const filteredPolicies = useMemo(() => {
    return mockPolicies.filter((policy) => {
      const matchesTab = activeTab === 'all' || policy.status === activeTab;
      const matchesSearch =
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.policyId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
      return matchesTab && matchesSearch && matchesStatus;
    });
  }, [activeTab, searchQuery, statusFilter]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    trackAction("POLICY", "POLICY_FILTER_CHANGED", { tab });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    trackAction("POLICY", "POLICY_STATUS_FILTER_CHANGED", { status: value });
    // If a specific status is selected, update the active tab to match
    if (value !== 'all') {
      setActiveTab(value);
    }
  };

  const counts = {
    all: mockPolicies.length,
    active: mockPolicies.filter((p) => p.status === "active").length,
    pending: mockPolicies.filter((p) => p.status === "pending").length,
    expired: mockPolicies.filter((p) => p.status === "expired").length,
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPolicies = filteredPolicies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-8 mt-8 p-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Policies</h2>
            <p className="text-brand-text-muted">
              Manage your insurance policies and coverage
            </p>
          </div>
          <div className="flex gap-4">
            <button
              className="flex items-center gap-2 bg-brand-primary text-brand-bg px-4 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => trackAction("POLICY", "POLICY_CREATION_STARTED")}
              disabled={!isConnected}
            >
              <Plus size={20} />
              New Policy
            </button>
            <FilterDropdown
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'expired', label: 'Expired' },
              ]}
              selectedValue={statusFilter}
              onSelect={handleStatusFilterChange}
              placeholder="Filter by status"
              className="bg-brand-primary text-stellar-card font-bold rounded-lg"
            />
          </div>
        </div>
        
        {/* Wallet Status Banner */}
        {!isConnected && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Wallet Connection Required
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Please connect your wallet to create and manage policies
                </p>
              </div>
              <div className="flex-shrink-0">
                <WalletConnectButton showBalance={true} />
              </div>
            </div>
          </div>
        )}
        
        {isConnected && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Wallet Connected
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  You're ready to create and manage policies
                </p>
              </div>
              <div className="flex-shrink-0">
                <WalletStatus showBalance={true} showAddress={false} compact={true} />
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted"
            size={20}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }
            }
            className="w-full bg-transparent border border-brand-border rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex gap-4 border-b border-brand-border pb-4">
          {(["all", "active", "pending", "expired"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${activeTab === tab
                ? "bg-[#1e2440] text-white"
                : "text-brand-text-muted hover:text-white"
                }`}
            >
              {tab === 'all' ? 'All' : tab} ({counts[tab]})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPolicies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
          {paginatedPolicies.length === 0 && (
            <div className="col-span-full py-20 text-center text-brand-text-muted">
              No policies found for this status.
            </div>
          )}
        </div>

        <Pagination
          totalItems={filteredPolicies.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          className="mt-4"
          pageName="Policies"
        />
      </div>
    </ProtectedRoute>
  );
}
