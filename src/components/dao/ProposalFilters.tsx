"use client";

import React from "react";

interface ProposalFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

export default function ProposalFilters({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
}: ProposalFiltersProps) {
  const filterButtons = [
    { id: "all", label: "All Proposals" },
    { id: "unvoted", label: "Not Voted" },
    { id: "voted", label: "Voted" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
      {/* Search Input */}
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search proposals..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#1A1F35] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#22BBF9] transition-colors"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {filterButtons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => onFilterChange(btn.id)}
            className={`px-4 py-2 rounded-lg transition-all font-medium ${
              filter === btn.id
                ? "bg-[#22BBF9] text-white"
                : "bg-[#1A1F35] text-gray-400 hover:bg-[#1A1F35]/70"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
