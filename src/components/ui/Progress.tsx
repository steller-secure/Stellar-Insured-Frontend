import React from "react";
import { cn } from "@/design-system";
import type { UIColor, UIFieldSize } from "@/design-system";

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Current value, clamped into `[0, max]`. */
  value: number;
  max?: number;
  color?: UIColor;
  size?: UIFieldSize;
  /** Accessible name for the bar. Required unless `aria-labelledby` is set. */
  label?: string;
  /** Keeps `label` as the accessible name without drawing it above the bar. */
  hideLabel?: boolean;
  /** Renders the percentage next to the bar. */
  showValue?: boolean;
}

const trackSizes: Record<UIFieldSize, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const fillColors: Record<UIColor, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
  neutral: "bg-neutral",
};

/**
 * Determinate progress bar. Takes the same `color` / `size` vocabulary as the
 * other primitives so a "success" bar matches a "success" badge.
 */
export function Progress({
  value,
  max = 100,
  color = "primary",
  size = "md",
  label,
  hideLabel = false,
  showValue = false,
  className = "",
  ...props
}: ProgressProps) {
  const safeMax = max > 0 ? max : 100;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div className={cn("w-full", className)} {...props}>
      {((label && !hideLabel) || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          {label && !hideLabel && (
            <span className="font-medium text-fg">{label}</span>
          )}
          {showValue && <span className="ml-auto text-fg-muted">{percent}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label}
        className={cn(
          "w-full overflow-hidden rounded-pill bg-neutral-soft",
          trackSizes[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-pill transition-[width] duration-300 ease-standard",
            fillColors[color],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
