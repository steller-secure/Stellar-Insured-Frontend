import React, { forwardRef } from "react";
import {
  cn,
  controlMotion,
  controlSizeRecipe,
  disabledControl,
  focusRing,
  iconControlSizeRecipe,
  resolveLegacyVariant,
  ringRecipe,
  surfaceRecipe,
} from "@/design-system";
import type { AnyVariant, UIColor, UISize } from "@/design-system";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /**
   * Emphasis of the button. The pre-token names `primary` / `secondary` /
   * `danger` are still accepted and resolve to the equivalent
   * `variant` + `color` pair.
   */
  variant?: AnyVariant;

  /** Meaning of the button. Defaults to `primary`. */
  color?: UIColor;

  size?: UISize;
  isLoading?: boolean;
  fullWidth?: boolean;

  /** Renders a square button sized for a single icon. */
  iconOnly?: boolean;

  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant,
      color,
      size = "md",
      isLoading = false,
      fullWidth = false,
      iconOnly = false,
      leadingIcon,
      trailingIcon,
      className = "",
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const resolved = resolveLegacyVariant(variant, color, {
      variant: "solid",
      color: "primary",
    });

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden font-medium",
          "active:scale-[0.98] motion-reduce:active:scale-100",
          controlMotion,
          focusRing,
          disabledControl,
          surfaceRecipe[resolved.variant][resolved.color],
          ringRecipe[resolved.color],
          iconOnly
            ? iconControlSizeRecipe[size]
            : controlSizeRecipe[size],
          resolved.variant === "link" &&
            "h-auto px-0 underline-offset-4",
          fullWidth && "w-full",
          isLoading && "cursor-wait",
          className,
        )}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        <span
          className={cn(
            "inline-flex items-center justify-center gap-2",
            isLoading && "invisible",
          )}
        >
          {leadingIcon}
          {children}
          {trailingIcon}
        </span>

        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>

            <span className="sr-only">Loading</span>
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";