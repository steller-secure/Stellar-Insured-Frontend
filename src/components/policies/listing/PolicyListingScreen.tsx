"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { POLICY_CATEGORIES_MOCK } from "@/data/policies/listing/policy-listing-mock";
import { PolicyCategoryWithLayout } from "@/types/policies/policy-listing";
import { POLICY_CATEGORY_LAYOUT } from "./policyCategoryLayout";
import { PolicyListingGrid } from "./PolicyListingGrid";
import { PolicyListingLoadingState } from "./PolicyListingLoadingState";
import { PolicyListingErrorState } from "./PolicyListingErrorState";
import { PolicyCategoryListingScreen } from "./PolicyCategoryListingScreen";
import { AdvancedFilterPanel } from "./AdvancedFilterPanel";
import { usePolicyFilters } from "@/hooks/usePolicyFilters";

type UiStatus = "loading" | "success" | "error";

const SIMULATED_LOADING_MS = 250;
const SIMULATE_ERROR = false;

function PolicyListingContent() {
  const [status, setStatus] = useState<UiStatus>("loading");
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  // Use the filter hook
  const {
    filterState,
    activeFilterCount,
    setSearchQuery,
    toggleCoverageType,
    toggleProvider,
    setPremiumRange,
    setDeductibleRange,
    clearAllFilters,
  } = usePolicyFilters();

  const items = useMemo<PolicyCategoryWithLayout[]>(() => {
    return POLICY_CATEGORIES_MOCK.map((c) => ({
      ...c,
      layout: POLICY_CATEGORY_LAYOUT[c.id],
    }));
  }, []);

  // Filter items based on active filters
  const filteredItems = useMemo(() => {
    if (activeFilterCount === 0) {
      return items;
    }

    return items.filter((item) => {
      // Filter by search query
      if (filterState.searchQuery) {
        const query = filterState.searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDescription = item.description
          .toLowerCase()
          .includes(query);
        if (!matchesTitle && !matchesDescription) {
          return false;
        }
      }

      // Filter by coverage types
      if (filterState.coverageTypes.length > 0) {
        if (!filterState.coverageTypes.includes(item.id as any)) {
          return false;
        }
      }

      return true;
    });
  }, [items, filterState, activeFilterCount]);

  const load = useCallback(() => {
    setStatus("loading");

    window.setTimeout(() => {
      setStatus(SIMULATE_ERROR ? "error" : "success");
    }, SIMULATED_LOADING_MS);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleLearnMore = useCallback(
    (item: PolicyCategoryWithLayout) => {
      router.push(`/policies/listing?category=${item.id}`);
    },
    [router],
  );

  return (
    <div className="relative w-full max-w-[1440px] min-h-screen bg-white dark:bg-[#101935] overflow-hidden">
      {categoryId ? (
        <PolicyCategoryListingScreen categoryId={categoryId} />
      ) : (
        <>
          {/* Advanced Filter Panel */}
          <AdvancedFilterPanel
            filterState={filterState}
            activeFilterCount={activeFilterCount}
            onSearchChange={setSearchQuery}
            onCoverageTypeToggle={toggleCoverageType}
            onProviderToggle={toggleProvider}
            onPremiumRangeChange={setPremiumRange}
            onDeductibleRangeChange={setDeductibleRange}
            onClearAll={clearAllFilters}
          />

          <div className="absolute left-1/2 top-14 w-full max-w-[1040px] -translate-x-1/2 px-6 text-center pointer-events-none sm:top-20 lg:top-[90px]">
            <h1 className="text-black dark:text-white text-[28px] font-bold leading-tight sm:text-[36px] lg:text-[40px]">
              Insurance Categories
            </h1>
            <p className="mt-3 mx-auto max-w-[960px] text-gray-700 dark:text-white text-[14px] font-semibold leading-relaxed sm:text-[16px] lg:text-[18px]">
              We offer a wide range of insurance products to protect what
              matters most to you, all
              <br className="hidden sm:block" />
              powered by blockchain technology.
            </p>
          </div>

          {status === "loading" && <PolicyListingLoadingState />}

          {status === "error" && (
            <PolicyListingErrorState
              message="Unable to load policy categories."
              onRetry={load}
            />
          )}

          {status === "success" && (
            <PolicyListingGrid
              items={filteredItems}
              onLearnMore={handleLearnMore}
              totalCount={items.length}
              filteredCount={filteredItems.length}
              isFiltered={activeFilterCount > 0}
            />
          )}
        </>
      )}
    </div>
  );
}

function PolicyListingLoading() {
  return (
    <div className="relative w-full max-w-[1440px] min-h-screen bg-white dark:bg-[#101935] overflow-hidden">
      <div className="absolute left-1/2 top-14 w-full max-w-[1040px] -translate-x-1/2 px-6 text-center pointer-events-none sm:top-20 lg:top-[90px]">
        <h1 className="text-black dark:text-white text-[28px] font-bold leading-tight sm:text-[36px] lg:text-[40px]">
          Insurance Categories
        </h1>
        <p className="mt-3 mx-auto max-w-[960px] text-gray-700 dark:text-white text-[14px] font-semibold leading-relaxed sm:text-[16px] lg:text-[18px]">
          We offer a wide range of insurance products to protect what matters
          most to you, all
          <br className="hidden sm:block" />
          powered by blockchain technology.
        </p>
      </div>
      <PolicyListingLoadingState />
    </div>
  );
}

export function PolicyListingScreen() {
  return (
    <Suspense fallback={<PolicyListingLoading />}>
      <PolicyListingContent />
    </Suspense>
  );
}
