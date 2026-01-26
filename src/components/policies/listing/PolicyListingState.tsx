"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { POLICY_CATEGORIES_MOCK } from "@/data/policies/listing/policy-listing-mock";
import { PolicyCategoryWithLayout } from "@/types/policies/policy-listing";
import { POLICY_CATEGORY_LAYOUT } from "./policyCategoryLayout";
import { PolicyListingGrid } from "./PolicyListingGrid";
import { PolicyPurchaseEntryModal } from "../purchase/PolicyPurchaseEntryModal";
import type { PolicyPurchasePayload } from "@/data/policies/listing/policy-purchase-flow-mock";
import { POLICY_PLANS_BY_CATEGORY, PolicyPlan } from "@/data/policies/listing/policy-plans-mock";
import { PolicyListingLoadingState } from "./PolicyListingLoadingState";
import { PolicyListingErrorState } from "./PolicyListingErrorState";

type UiStatus = "loading" | "success" | "error";

const SIMULATED_LOADING_MS = 250;

const SIMULATE_ERROR = false;

export function PolicyListingScreen() {
  const [status, setStatus] = useState<UiStatus>("loading");
  const [selectedPlan, setSelectedPlan] = useState<PolicyPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    load();
  }, [load]);

  const handleLearnMore = useCallback((item: PolicyCategoryWithLayout) => {
    const plans = POLICY_PLANS_BY_CATEGORY[item.id] ?? [];
    const featuredPlan = plans.find((plan) => plan.isFeatured) ?? plans[0] ?? null;
    setSelectedPlan(featuredPlan);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  }, []);

  const handleConfirm = useCallback(
    (_payload: PolicyPurchasePayload) => {
      handleCloseModal();
    },
    [handleCloseModal]
  );

  return (
    <div className="w-[1440px] h-[1024px] relative bg-[#101935] overflow-hidden">
      {/* Title (Figma: #080D24) */}
      <div className="w-[541px] h-14 left-[423px] top-[91px] absolute text-center justify-start text-[#080D24] text-5xl font-bold font-['Inter']">
        Insurance Categories
      </div>

      {/* Subtitle */}
      <div className="w-[958px] h-11 left-[215px] top-[176px] absolute text-center justify-start text-white text-xl font-bold font-['Inter']">
        We offer a wide range of insurance products to protect what matters most to you, all
        <br />
        powered by blockchain technology.
        <br />
      </div>

      {status === "loading" && <PolicyListingLoadingState />}

      {status === "error" && (
        <PolicyListingErrorState message="Unable to load policy categories." onRetry={load} />
      )}

      {status === "success" && <PolicyListingGrid items={items} onLearnMore={handleLearnMore} />}

      <PolicyPurchaseEntryModal
        isOpen={isModalOpen}
        plan={selectedPlan}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
