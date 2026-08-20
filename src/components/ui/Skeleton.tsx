import React from "react";
import { cn } from "@/design-system";

export type SkeletonShape = "text" | "rect" | "circle" | "pill";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape;
  /** Number of stacked lines. Only meaningful for `shape="text"`. */
  lines?: number;
}

const shapes: Record<SkeletonShape, string> = {
  // `text` carries a default height; the others take theirs from the caller so
  // a smaller `h-*` in `className` is not fighting a default of the same
  // specificity.
  text: "h-4 rounded-field",
  rect: "rounded-field",
  circle: "rounded-pill aspect-square",
  pill: "rounded-pill",
};

/**
 * The single skeleton primitive. Every loading placeholder in the app is built
 * from this so the tint and the shimmer timing only exist in one place.
 */
export function Skeleton({
  shape = "rect",
  lines = 1,
  className = "",
  ...props
}: SkeletonProps) {
  const base = cn(
    "animate-pulse bg-neutral-soft motion-reduce:animate-none",
    shapes[shape],
  );

  if (shape === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)} aria-hidden="true" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(base, index === lines - 1 && "w-4/5")}
          />
        ))}
      </div>
    );
  }

  return <div className={cn(base, className)} aria-hidden="true" {...props} />;
}
