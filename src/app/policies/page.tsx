"use client";

import React, { useState } from "react";
import { PolicyCard } from "@/components/policies/PolicyCard";
import { mockPolicies } from "@/data/mockPolicies";
import { Search, Plus, Filter } from "lucide-react";

export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPolicies = mockPolicies.filter((policy) => {
    const matchesTab = policy.status === activeTab;
    const matchesSearch =
      policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.policyId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const counts = {
    active: mockPolicies.filter((p) => p.status === "active").length,
    pending: mockPolicies.filter((p) => p.status === "pending").length,
    expired: mockPolicies.filter((p) => p.status === "expired").length,
  };

  return (
      <div className="flex flex-col gap-8 mt-8 p-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-2">My Policies</h2>
            <p className="text-brand-text-muted">
              Manage your insurance policies and coverage
            </p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-brand-primary text-brand-bg px-4 py-2 rounded-lg font-bold">
              <Plus size={20} />
              New Policy
            </button>
            <button className="flex items-center gap-2 bg-brand-primary text-brand-bg px-4 py-2 rounded-lg font-bold">
              <Filter size={20} />
              All Policies
            </button>
          </div>
        </div>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted"
            size={20}
          />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-brand-border rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex gap-4 border-b border-brand-border pb-4">
          {(["active", "pending", "expired"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "bg-[#1e2440] text-white"
                  : "text-brand-text-muted hover:text-white"
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
          {filteredPolicies.length === 0 && (
            <div className="col-span-full py-20 text-center text-brand-text-muted">
              No policies found for this status.
            </div>
          )}
        </div>
      </div>
  );
}
