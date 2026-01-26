"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { POLICY_CATEGORIES_MOCK } from "@/data/policies/listing/policy-listing-mock";
import { PolicyCategoryWithLayout } from "@/types/policies/policy-listing";
import { POLICY_CATEGORY_LAYOUT } from "./policyCategoryLayout";
import { PolicyListingGrid } from "./PolicyListingGrid";
import { PolicyListingLoadingState } from "./PolicyListingLoadingState";
import { PolicyListingErrorState } from "./PolicyListingErrorState";
import { PolicyCategoryListingScreen } from "./PolicyCategoryListingScreen";

type UiStatus = "loading" | "success" | "error";

const SIMULATED_LOADING_MS = 250;
const SIMULATE_ERROR = false;

export function PolicyListingScreen() {
  const [status, setStatus] = useState<UiStatus>("loading");
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  const items = useMemo<PolicyCategoryWithLayout[]>(() => {
    return POLICY_CATEGORIES_MOCK.map((c) => ({
      ...c,
      layout: POLICY_CATEGORY_LAYOUT[c.id],
    }));
  }, []);

  const load = useCallback(() => {
    setStatus("loading");

    window.setTimeout(() => {
      setStatus(SIMULATE_ERROR ? "error" : "success");
    }, SIMULATED_LOADING_MS);
  }, []);

  useEffect(() => {
    if (!categoryId) {
      load();
    }
  }, [load, categoryId]);

  const handleLearnMore = useCallback(
    (item: PolicyCategoryWithLayout) => {
      router.push(`/policies/listing?category=${item.id}`);
    },
    [router]
  );

  return (
    <div className="relative w-full max-w-[1440px] min-h-screen bg-[#101935] overflow-hidden">
      {categoryId ? (
        <PolicyCategoryListingScreen categoryId={categoryId} />
      ) : (
        <>
      <div className="absolute left-1/2 top-14 w-full max-w-[1040px] -translate-x-1/2 px-6 text-center pointer-events-none sm:top-20 lg:top-[90px]">
        <h1 className="text-[#080D24] text-[28px] font-bold leading-tight sm:text-[36px] lg:text-[40px]">
          Insurance Categories
        </h1>
        <p className="mt-3 mx-auto max-w-[960px] text-white text-[14px] font-semibold leading-relaxed sm:text-[16px] lg:text-[18px]">
          We offer a wide range of insurance products to protect what matters most to you, all
          <br className="hidden sm:block" />
          powered by blockchain technology.
        </p>
      </div>

      {status === "loading" && <PolicyListingLoadingState />}

      {status === "error" && (
        <PolicyListingErrorState message="Unable to load policy categories." onRetry={load} />
      )}

      {status === "success" && <PolicyListingGrid items={items} onLearnMore={handleLearnMore} />}
        </>
      )}
    </div>
  );
}
