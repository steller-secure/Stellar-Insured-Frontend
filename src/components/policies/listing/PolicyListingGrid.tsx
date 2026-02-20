import React from "react";
import type { PolicyCategoryWithLayout } from "@/types/policies/policy-listing";
import { PolicyListingCard } from "./PolicyListingCard";

type PolicyListingGridProps = {
  items: PolicyCategoryWithLayout[];
  onLearnMore: (item: PolicyCategoryWithLayout) => void;
  totalCount?: number;
  filteredCount?: number;
  isFiltered?: boolean;
};

export function PolicyListingGrid({
  items,
  onLearnMore,
  totalCount,
  filteredCount,
  isFiltered = false,
}: PolicyListingGridProps) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pt-[260px] sm:px-8 sm:pt-[280px] lg:px-0 lg:pt-[300px]">
      {/* Results count indicator */}
      {isFiltered &&
        filteredCount !== undefined &&
        totalCount !== undefined && (
          <div className="mb-4 px-2 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-sm text-slate-300">
              Showing{" "}
              <span className="font-semibold text-cyan-400">
                {filteredCount}
              </span>{" "}
              {filteredCount === totalCount ? "of" : "of"}{" "}
              <span className="font-semibold text-white">{totalCount}</span>{" "}
              policies
              {filteredCount === 0 && (
                <span className="ml-2 text-amber-400">
                  (No policies match your filters)
                </span>
              )}
            </p>
          </div>
        )}

      {items.length > 0 ? (
        <div className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-8">
          {items.map((item) => (
            <PolicyListingCard
              key={item.id}
              item={item}
              onLearnMore={onLearnMore}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No policies found
          </h3>
          <p className="text-slate-400 max-w-md">
            Try adjusting your search or filter criteria to find what you're
            looking for.
          </p>
        </div>
      )}
    </div>
  );
}
