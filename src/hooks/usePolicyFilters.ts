"use client";

import { useCallback, useMemo, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  PolicyFilterState,
  DEFAULT_FILTER_STATE,
  CoverageType,
  ProviderId,
} from "@/types/policies/filter";

const DEBOUNCE_DELAY = 300;

export function usePolicyFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Parse URL params into filter state
  const filterState = useMemo<PolicyFilterState>(() => {
    const searchQuery = searchParams.get("q") || "";
    const coverageTypes =
      (searchParams
        .get("coverage")
        ?.split(",")
        .filter(Boolean) as CoverageType[]) || [];
    const providers =
      (searchParams
        .get("providers")
        ?.split(",")
        .filter(Boolean) as ProviderId[]) || [];
    const premiumMin = Number(searchParams.get("premiumMin")) || 0;
    const premiumMax = Number(searchParams.get("premiumMax")) || 1000;
    const deductibleMin = Number(searchParams.get("deductibleMin")) || 0;
    const deductibleMax = Number(searchParams.get("deductibleMax")) || 10000;

    return {
      searchQuery,
      coverageTypes,
      providers,
      premiumRange: { min: premiumMin, max: premiumMax },
      deductibleRange: { min: deductibleMin, max: deductibleMax },
    };
  }, [searchParams]);

  // Update URL with new filter state
  const updateURL = useCallback(
    (newState: Partial<PolicyFilterState>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Handle search query
      if (newState.searchQuery !== undefined) {
        if (newState.searchQuery) {
          params.set("q", newState.searchQuery);
        } else {
          params.delete("q");
        }
      }

      // Handle coverage types
      if (newState.coverageTypes !== undefined) {
        if (newState.coverageTypes.length > 0) {
          params.set("coverage", newState.coverageTypes.join(","));
        } else {
          params.delete("coverage");
        }
      }

      // Handle providers
      if (newState.providers !== undefined) {
        if (newState.providers.length > 0) {
          params.set("providers", newState.providers.join(","));
        } else {
          params.delete("providers");
        }
      }

      // Handle premium range
      if (newState.premiumRange !== undefined) {
        if (newState.premiumRange.min > 0) {
          params.set("premiumMin", String(newState.premiumRange.min));
        } else {
          params.delete("premiumMin");
        }
        if (newState.premiumRange.max < 1000) {
          params.set("premiumMax", String(newState.premiumRange.max));
        } else {
          params.delete("premiumMax");
        }
      }

      // Handle deductible range
      if (newState.deductibleRange !== undefined) {
        if (newState.deductibleRange.min > 0) {
          params.set("deductibleMin", String(newState.deductibleRange.min));
        } else {
          params.delete("deductibleMin");
        }
        if (newState.deductibleRange.max < 10000) {
          params.set("deductibleMax", String(newState.deductibleRange.max));
        } else {
          params.delete("deductibleMax");
        }
      }

      const newURL = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      router.replace(newURL, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filterState.searchQuery);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [filterState.searchQuery]);

  // Set search query with debounce
  const setSearchQuery = useCallback(
    (query: string) => {
      updateURL({ searchQuery: query });
    },
    [updateURL],
  );

  // Toggle coverage type
  const toggleCoverageType = useCallback(
    (type: CoverageType) => {
      const current = filterState.coverageTypes;
      const newTypes = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      updateURL({ coverageTypes: newTypes });
    },
    [filterState.coverageTypes, updateURL],
  );

  // Toggle provider
  const toggleProvider = useCallback(
    (provider: ProviderId) => {
      const current = filterState.providers;
      const newProviders = current.includes(provider)
        ? current.filter((p) => p !== provider)
        : [...current, provider];
      updateURL({ providers: newProviders });
    },
    [filterState.providers, updateURL],
  );

  // Set premium range
  const setPremiumRange = useCallback(
    (range: { min: number; max: number }) => {
      updateURL({ premiumRange: range });
    },
    [updateURL],
  );

  // Set deductible range
  const setDeductibleRange = useCallback(
    (range: { min: number; max: number }) => {
      updateURL({ deductibleRange: range });
    },
    [updateURL],
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterState.searchQuery) count++;
    if (filterState.coverageTypes.length > 0) count++;
    if (filterState.providers.length > 0) count++;
    if (filterState.premiumRange.min > 0 || filterState.premiumRange.max < 1000)
      count++;
    if (
      filterState.deductibleRange.min > 0 ||
      filterState.deductibleRange.max < 10000
    )
      count++;
    return count;
  }, [filterState]);

  return {
    filterState,
    debouncedSearch,
    activeFilterCount,
    setSearchQuery,
    toggleCoverageType,
    toggleProvider,
    setPremiumRange,
    setDeductibleRange,
    clearAllFilters,
  };
}
