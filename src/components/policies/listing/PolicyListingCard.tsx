import React from "react";
import type { PolicyCategoryWithLayout } from "@/types/policies/policy-listing";
import { POLICY_LISTING_CARD_UI_BY_ID } from "./policyListingCard.ui";

type PolicyListingCardProps = {
  item: PolicyCategoryWithLayout;
  onLearnMore: (item: PolicyCategoryWithLayout) => void;
};

const DESCRIPTION_LINES: Record<PolicyCategoryWithLayout["id"], string[]> = {
  health: [
    "Protect yourself with blockchain-based",
    "health coverage that ensures transparent",
    "claims and instant payouts.",
  ],
  vehicle: [
    "Comprehensive coverage for your vehicles",
    "with automated claim processing powered",
    "by smart contracts.",
  ],
  property: [
    "Secure your property with tamper-proof",
    "policies that provide reliable protection and",
    "fast settlements.",
  ],
  travel: [
    "Worry-free travel with instant coverage",
    "and automated payouts for delayed",
    "flights and other travel issues.",
  ],
  crypto: [
    "Protect your digital assets, wallets, and",
    "NFTs against hacks, theft, and other",
    "crypto-specific risks.",
  ],
};

export function PolicyListingCard({ item, onLearnMore }: PolicyListingCardProps) {
  const ui = POLICY_LISTING_CARD_UI_BY_ID[item.id];
  const descriptionLines = DESCRIPTION_LINES[item.id] ?? [item.description];

  return (
    <div className={ui.cardClassName}>
      <div className={ui.iconTileClassName}>
        {ui.iconContentNode}
        {ui.iconOverlayNode}
      </div>

      <div className={ui.titleClassName}>{item.title}</div>
      <div className={ui.descriptionClassName}>
        {descriptionLines.map((line, index) => (
          <span key={`${item.id}-${index}`}>
            {line}
            {index < descriptionLines.length - 1 ? <br /> : null}
          </span>
        ))}
      </div>

      <button type="button" onClick={() => onLearnMore(item)} className={ui.ctaButtonClassName}>
        <span className={ui.ctaTextClassName}>Learn More</span>
      </button>

      {ui.extraDecorationClassName ? <div className={ui.extraDecorationClassName} aria-hidden /> : null}
    </div>
  );
}
