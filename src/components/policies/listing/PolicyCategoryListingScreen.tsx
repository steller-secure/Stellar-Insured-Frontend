"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { POLICY_CATEGORIES_MOCK } from "@/data/policies/listing/policy-listing-mock";
import { POLICY_PLANS_BY_CATEGORY, PolicyPlan } from "@/data/policies/listing/policy-plans-mock";
import type { PolicyCategoryId } from "@/types/policies/policy-listing";
import type { PolicyPurchasePayload } from "@/data/policies/listing/policy-purchase-flow-mock";
import { PolicyPurchaseEntryModal } from "@/components/policies/purchase/PolicyPurchaseEntryModal";

type PolicyCategoryListingScreenProps = {
  categoryId: string;
};

type SortOrder = "none" | "asc" | "desc";

type CoverageRangeId = "all" | "low" | "mid" | "high";

const COVERAGE_RANGES: Array<{ id: CoverageRangeId; label: string; min: number; max: number }> = [
  { id: "all", label: "All", min: 0, max: Number.POSITIVE_INFINITY },
  { id: "low", label: "Up to $50k", min: 0, max: 50000 },
  { id: "mid", label: "$50k - $150k", min: 50000, max: 150000 },
  { id: "high", label: "$150k+", min: 150000, max: Number.POSITIVE_INFINITY },
];

const DURATION_OPTIONS = [
  { id: "all", label: "All", months: null },
  { id: "6", label: "6 months", months: 6 },
  { id: "12", label: "12 months", months: 12 },
  { id: "24", label: "24 months", months: 24 },
];

const parseCurrency = (value: string) => Number(value.replace(/[^0-9.]/g, ""));

const parseDurationMonths = (value: string) => {
  const lower = value.toLowerCase();
  const amount = Number(value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(amount)) return 0;
  if (lower.includes("month")) return Math.round(amount);
  if (lower.includes("day")) return Math.max(1, Math.round(amount / 30));
  return 0;
};

const getFeaturedPlan = (categoryId: PolicyCategoryId) => {
  const plans = POLICY_PLANS_BY_CATEGORY[categoryId] ?? [];
  return plans.find((plan) => plan.isFeatured) ?? plans[0] ?? null;
};

export function PolicyCategoryListingScreen({ categoryId }: PolicyCategoryListingScreenProps) {
  const router = useRouter();
  const category = useMemo(
    () => POLICY_CATEGORIES_MOCK.find((item) => item.id === categoryId),
    [categoryId]
  );
  const plans = useMemo(
    () => (category ? POLICY_PLANS_BY_CATEGORY[category.id] ?? [] : []),
    [category]
  );
  const [selectedPlan, setSelectedPlan] = useState<PolicyPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priceOrder, setPriceOrder] = useState<SortOrder>("none");
  const [coverageRange, setCoverageRange] = useState<CoverageRangeId>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [deductibleOrder, setDeductibleOrder] = useState<SortOrder>("none");

  useEffect(() => {
    if (category) {
      setSelectedPlan(getFeaturedPlan(category.id));
    }
  }, [category]);

  const filteredPlans = useMemo(() => {
    let next = [...plans];

    if (coverageRange !== "all") {
      const range = COVERAGE_RANGES.find((item) => item.id === coverageRange);
      if (range) {
        next = next.filter((plan) => {
          const coverageValue = parseCurrency(plan.coverage);
          return coverageValue >= range.min && coverageValue <= range.max;
        });
      }
    }

    if (durationFilter !== "all") {
      const selected = DURATION_OPTIONS.find((item) => item.id === durationFilter);
      if (selected?.months) {
        next = next.filter((plan) => parseDurationMonths(plan.duration) === selected.months);
      }
    }

    const shouldSortByPrice = priceOrder !== "none";
    const shouldSortByDeductible = deductibleOrder !== "none";

    if (shouldSortByPrice || shouldSortByDeductible) {
      next.sort((a, b) => {
        let diff = 0;
        if (shouldSortByPrice) {
          diff =
            priceOrder === "asc"
              ? a.premiumAmount - b.premiumAmount
              : b.premiumAmount - a.premiumAmount;
        }
        if (diff === 0 && shouldSortByDeductible) {
          const aDeductible = parseCurrency(a.deductible);
          const bDeductible = parseCurrency(b.deductible);
          diff = deductibleOrder === "asc" ? aDeductible - bDeductible : bDeductible - aDeductible;
        }
        return diff;
      });
    }

    return next;
  }, [plans, coverageRange, durationFilter, priceOrder, deductibleOrder]);

  const handlePurchase = (plan: PolicyPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(category ? getFeaturedPlan(category.id) : null);
  };

  const handleConfirm = (_payload: PolicyPurchasePayload) => {
    handleCloseModal();
    router.push("/policies");
  };

  if (!category) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[1200px] flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="text-white text-2xl font-bold font-['Inter']">Policy Category Not Found</div>
        <div className="text-stone-300 text-sm font-bold font-['Inter']">
          The policy category you requested is unavailable.
        </div>
        <button
          type="button"
          onClick={() => router.push("/policies/listing")}
          className="mt-2 px-3.5 py-1.5 bg-white rounded-[5px] outline outline-1 outline-offset-[-1px] outline-black"
        >
          <span className="text-sky-400 text-sm font-bold font-['Inter']">Back to Categories</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-16 sm:pt-20">
      <button
        type="button"
        onClick={() => router.push("/policies/listing")}
        className="text-stone-300 text-sm font-bold font-['Inter'] hover:text-white"
      >
        Back to Categories
      </button>

      <div className="mt-6 text-center">
        <div className="text-[#080D24] text-[28px] font-bold font-['Inter'] sm:text-[34px] lg:text-[38px]">
          {category.title} Policies
        </div>
        <div className="mt-3 mx-auto max-w-[900px] text-white text-sm font-semibold font-['Inter'] sm:text-base">
          {category.description}
        </div>
      </div>

      <div className="mt-6 rounded-[12px] border border-[#2d3748] bg-[#1A1F35] p-4">
        <div className="text-white text-sm font-bold font-['Inter']">Filters</div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-widest text-[#A69D9D]">
            <span className="pl-3">Price</span>
            <div className="relative">
              <select
                value={priceOrder}
                onChange={(event) => setPriceOrder(event.target.value as SortOrder)}
                className="w-full appearance-none rounded-lg border border-[#2d3748] bg-[#101935] px-3 py-2 pr-12 text-xs font-bold text-white"
              >
                <option value="none">Default</option>
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-widest text-[#A69D9D]">
            <span className="pl-3">Coverage</span>
            <div className="relative">
              <select
                value={coverageRange}
                onChange={(event) => setCoverageRange(event.target.value as CoverageRangeId)}
                className="w-full appearance-none rounded-lg border border-[#2d3748] bg-[#101935] px-3 py-2 pr-12 text-xs font-bold text-white"
              >
                {COVERAGE_RANGES.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-widest text-[#A69D9D]">
            <span className="pl-3">Duration</span>
            <div className="relative">
              <select
                value={durationFilter}
                onChange={(event) => setDurationFilter(event.target.value)}
                className="w-full appearance-none rounded-lg border border-[#2d3748] bg-[#101935] px-3 py-2 pr-12 text-xs font-bold text-white"
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-widest text-[#A69D9D]">
            <span className="pl-3">Deductible</span>
            <div className="relative">
              <select
                value={deductibleOrder}
                onChange={(event) => setDeductibleOrder(event.target.value as SortOrder)}
                className="w-full appearance-none rounded-lg border border-[#2d3748] bg-[#101935] px-3 py-2 pr-12 text-xs font-bold text-white"
              >
                <option value="none">Default</option>
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white">
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-7">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-xl border border-[#2d3748] bg-[#1A1F35] px-6 py-5"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-white text-lg font-bold font-['Inter']">{plan.name}</div>
                {plan.isFeatured ? (
                  <span className="px-2 py-0.5 rounded-full bg-white text-sky-400 text-[10px] font-bold font-['Inter']">
                    Recommended
                  </span>
                ) : null}
              </div>
              <div className="text-[#A69D9D] text-sm font-bold font-['Inter']">
                {plan.description}
              </div>
              <div className="text-[#A69D9D] text-xs font-bold font-['Inter']">
                Coverage details: {plan.description}
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-9">
                  <div className="rounded-[8px] border border-[#2d3748] bg-[#151929] px-3 py-2">
                    <div className="text-[#A69D9D] text-[11px] font-bold font-['Inter']">
                      Policy ID
                    </div>
                    <div className="mt-1 text-white text-sm font-bold font-['Inter']">
                      {plan.policyNumber}
                    </div>
                  </div>
                  <div className="rounded-[8px] border border-[#2d3748] bg-[#151929] px-3 py-2">
                    <div className="text-[#A69D9D] text-[11px] font-bold font-['Inter']">
                      Coverage
                    </div>
                    <div className="mt-1 text-white text-sm font-bold font-['Inter']">
                      {plan.coverage}
                    </div>
                  </div>
                  <div className="rounded-[8px] border border-[#2d3748] bg-[#151929] px-3 py-2">
                    <div className="text-[#A69D9D] text-[11px] font-bold font-['Inter']">
                      Duration
                    </div>
                    <div className="mt-1 text-white text-sm font-bold font-['Inter']">
                      {plan.duration}
                    </div>
                  </div>
                  <div className="rounded-[8px] border border-[#2d3748] bg-[#151929] px-3 py-2">
                    <div className="text-[#A69D9D] text-[11px] font-bold font-['Inter']">
                      Deductible
                    </div>
                    <div className="mt-1 text-white text-sm font-bold font-['Inter']">
                      {plan.deductible}
                    </div>
                  </div>
                </div>
                <div className="rounded-[8px] border border-[#2d3748] bg-[#151929] px-3 py-3 flex h-full flex-col justify-between gap-4 lg:col-span-3">
                  <div>
                    <div className="text-[#A69D9D] text-[11px] font-bold font-['Inter']">Premium</div>
                    <div className="mt-1 text-white text-xl font-bold font-['Inter']">{plan.premium}</div>
                    <div className="mt-1 text-[#A69D9D] text-xs font-bold font-['Inter']">
                      {plan.billingCadence === "monthly" ? "Billed monthly" : "Per trip"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePurchase(plan)}
                    className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-brand-bg transition-colors hover:bg-brand-primary-hover"
                  >
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredPlans.length === 0 ? (
          <div className="rounded-xl border border-[#2d3748] bg-[#1A1F35] px-6 py-8 text-center text-[#A69D9D] text-sm font-bold font-['Inter']">
            No policies match the selected filters.
          </div>
        ) : null}
      </div>

      <PolicyPurchaseEntryModal
        isOpen={isModalOpen}
        plan={selectedPlan}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
