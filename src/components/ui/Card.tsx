import React, { forwardRef } from "react";
import {
  cn,
  elevationRecipe,
  focusRing,
  surfacePaddingRecipe,
} from "@/design-system";
import type { SurfacePadding, UIElevation } from "@/design-system";

/**
 * `default` and `elevated` are the pre-token names, kept so existing call
 * sites keep working. New code should pick a surface and an `elevation`.
 */
export type CardVariant =
  | "solid"
  | "soft"
  | "outline"
  | "ghost"
  | "default"
  | "elevated";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Elevation step, 0-4. Defaults to the variant's natural elevation. */
  elevation?: UIElevation;
  padding?: SurfacePadding;
  /** Adds hover/focus affordances for cards that act as a single target. */
  interactive?: boolean;
}

const cardVariants: Record<
  CardVariant,
  { classes: string; elevation: UIElevation }
> = {
  solid: {
    classes: "bg-surface-raised border border-border text-fg",
    elevation: 1,
  },
  soft: {
    classes: "bg-surface-sunken border border-border-subtle text-fg",
    elevation: 0,
  },
  outline: {
    classes: "bg-transparent border border-dashed border-border text-fg",
    elevation: 0,
  },
  ghost: {
    classes: "bg-transparent border border-transparent text-fg",
    elevation: 0,
  },
  // Deprecated aliases.
  default: {
    classes: "bg-surface-raised border border-border text-fg",
    elevation: 1,
  },
  elevated: {
    classes: "bg-surface-raised border border-border-strong text-fg",
    elevation: 3,
  },
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = "",
      variant = "solid",
      elevation,
      padding = "none",
      interactive = false,
      ...props
    },
    ref,
  ) => {
    const spec = cardVariants[variant] ?? cardVariants.solid;

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-card",
          spec.classes,
          elevationRecipe[elevation ?? spec.elevation],
          surfacePaddingRecipe[padding],
          interactive && [
            "transition-[transform,box-shadow] duration-200 ease-standard",
            "hover:-translate-y-0.5 hover:shadow-elevation-3 motion-reduce:hover:translate-y-0",
            focusRing,
            "focus-visible:ring-primary",
          ],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
