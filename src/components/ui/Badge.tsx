import React from "react";
import { badgeSizeRecipe, cn, staticSurfaceRecipe } from "@/design-system";
import type { UIColor, UIFieldSize, UIVariant } from "@/design-system";

/**
 * Pre-token badge names encoded the colour in the variant. They are still
 * accepted and resolve to `variant="soft"` with the matching colour.
 */
type LegacyBadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral";

const LEGACY_BADGE_COLORS: Record<LegacyBadgeVariant, UIColor> = {
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "error",
  neutral: "neutral",
};

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  variant?: UIVariant | LegacyBadgeVariant;
  color?: UIColor;
  size?: UIFieldSize;
  /**
   * @deprecated Pass `variant="soft"` (tinted) or `variant="solid"` instead.
   */
  soft?: boolean;
}

function isLegacyVariant(
  variant: string | undefined,
): variant is LegacyBadgeVariant {
  return variant !== undefined && variant in LEGACY_BADGE_COLORS;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant,
  color,
  size = "md",
  soft,
  ...props
}) => {
  let resolvedVariant: UIVariant;
  let resolvedColor: UIColor;

  if (isLegacyVariant(variant)) {
    resolvedColor = color ?? LEGACY_BADGE_COLORS[variant];
    resolvedVariant = soft === false ? "solid" : "soft";
  } else {
    resolvedColor = color ?? "neutral";
    resolvedVariant = variant ?? (soft === false ? "solid" : "soft");
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill font-semibold uppercase tracking-wide whitespace-nowrap",
        staticSurfaceRecipe[resolvedVariant][resolvedColor],
        badgeSizeRecipe[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
