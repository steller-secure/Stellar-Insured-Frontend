"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { mockClaims } from "@/data/mockData";
import { Pagination } from "@/components/Pagination";
import { FilterDropdown } from "@/components/FilterDropdown";
import { Search, Plus } from "lucide-react";

const CLAIM_STATUSES = [
  { value: 'all', label: 'All Claims' },
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Rejected', label: 'Rejected' },
];

const statusColors = {
  Active: "bg-green-500/20 text-green-400 border-green-500/20",
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
  Approved: "bg-cyan-500/20 text-cyan-400 border-cyan-500/20",
  Rejected: "bg-rose-500/20 text-rose-400 border-rose-500/20",
};

export default function ClaimsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const itemsPerPage = 10;

  // Filter claims based on search term and status
  const filteredClaims = useMemo(() => {
    return mockClaims.filter(claim => {
      const matchesSearch = claim.policyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Pagination
  const paginatedClaims = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClaims.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClaims, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Claims</h1>
          <p className="text-gray-400">
            Manage and track your insurance claims
          </p>
        </div>

        <div className="flex md:flex-row justify-between items-center gap-10">
          <div className="relative flex items-center w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
            <Input
              type="text"
              label=""
              placeholder="Search"
              className="w-full rounded-lg bg-transparent border border-slate-700 py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48 bg-stellar-secondary text-stellar-card rounded-lg">
              <FilterDropdown
                options={CLAIM_STATUSES}
                selectedValue={statusFilter}
                onSelect={setStatusFilter}
                placeholder="Filter by status"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {paginatedClaims.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No claims found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {paginatedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="group relative overflow-hidden rounded-xl bg-slate-900/50 p-6 transition-all hover:bg-slate-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold text-white">
                          {claim.incidentType}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Policy ID: {claim.policyId} • Claim ID: {claim.id}
                        </p>
                        <p className="text-sm text-gray-400 max-w-lg">
                          {claim.description ||
                            "Compensation for assets lost during security breach"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          statusColors[claim.status]
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div className="mt-6 flex items-end gap-12">
                      <div>
                        <p className="text-xs text-gray-400">Amount Claimed</p>
                        <p className="text-xl font-bold text-white">
                          {claim.amountFormatted}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Date Filed</p>
                        <p className="text-lg font-medium text-white">
                          {claim.dateFiled}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button variant="primary" fullWidth className="py-2!">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Pagination
                  totalItems={filteredClaims.length}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  pageName="Claims"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sidebar Buttons */}
      <div className="flex flex-col gap-3 min-w-[200px]">
        <Link href="/claims/new">
          <Button variant="primary" fullWidth>
            <Plus className="mr-2 h-4 w-4" />
            New Claim
          </Button>
        </Link>
      </div>
    </div>
  );
}
