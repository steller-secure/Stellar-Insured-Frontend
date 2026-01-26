import React from "react";
import type { PolicyCategoryWithLayout } from "@/types/policies/policy-listing";
import { PolicyListingCard } from "./PolicyListingCard";

type PolicyListingGridProps = {
  items: PolicyCategoryWithLayout[];
  onLearnMore: (item: PolicyCategoryWithLayout) => void;
};

export function PolicyListingGrid({ items, onLearnMore }: PolicyListingGridProps) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 pt-[260px] sm:px-8 sm:pt-[280px] lg:px-0 lg:pt-[300px]">
      <div className="grid grid-cols-1 place-items-center gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-8">
        {items.map((item) => (
          <PolicyListingCard key={item.id} item={item} onLearnMore={onLearnMore} />
        ))}
      </div>
    </div>
  );
}
