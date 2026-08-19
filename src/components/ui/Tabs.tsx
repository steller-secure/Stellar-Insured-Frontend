"use client";

import React, { useCallback, useRef } from "react";
import { cn, controlMotion, focusRing, ringRecipe } from "@/design-system";
import type { UIColor, UIFieldSize } from "@/design-system";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export type TabsVariant = "underline" | "solid" | "soft";

export interface TabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "color"> {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  variant?: TabsVariant;
  color?: UIColor;
  size?: UIFieldSize;
  /** Accessible name for the tab list. */
  label?: string;
  /**
   * Shared prefix used to wire `aria-controls` / `aria-labelledby` between the
   * tabs and their `<TabPanel>`s. Pass the same value to both; when omitted the
   * association is left out rather than pointing at ids that do not exist.
   */
  idPrefix?: string;
}

const sizeRecipe: Record<UIFieldSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const activeRecipe: Record<TabsVariant, Record<UIColor, string>> = {
  underline: {
    primary: "border-primary text-primary",
    secondary: "border-secondary text-secondary",
    success: "border-success text-success",
    warning: "border-warning text-warning",
    error: "border-error text-error",
    info: "border-info text-info",
    neutral: "border-fg text-fg",
  },
  solid: {
    primary: "bg-primary text-primary-fg",
    secondary: "bg-secondary text-secondary-fg",
    success: "bg-success text-success-fg",
    warning: "bg-warning text-warning-fg",
    error: "bg-error text-error-fg",
    info: "bg-info text-info-fg",
    neutral: "bg-neutral text-neutral-fg",
  },
  soft: {
    primary: "bg-primary-soft text-primary-on-soft",
    secondary: "bg-secondary-soft text-secondary-on-soft",
    success: "bg-success-soft text-success-on-soft",
    warning: "bg-warning-soft text-warning-on-soft",
    error: "bg-error-soft text-error-on-soft",
    info: "bg-info-soft text-info-on-soft",
    neutral: "bg-neutral-soft text-neutral-on-soft",
  },
};

const inactiveRecipe: Record<TabsVariant, string> = {
  underline: "border-transparent text-fg-muted hover:text-fg",
  solid: "text-fg-muted hover:bg-neutral/10 hover:text-fg",
  soft: "text-fg-muted hover:bg-neutral/10 hover:text-fg",
};

const listRecipe: Record<TabsVariant, string> = {
  underline: "gap-1 border-b border-border",
  solid: "gap-1 rounded-control bg-surface-sunken p-1",
  soft: "gap-1 rounded-control bg-surface-sunken p-1",
};

const shapeRecipe: Record<TabsVariant, string> = {
  underline: "-mb-px border-b-2 rounded-none",
  solid: "rounded-field",
  soft: "rounded-field",
};

/**
 * Keyboard-navigable tab list following the WAI-ARIA tabs pattern: arrow keys
 * move between tabs, Home/End jump to the ends, and only the active tab is in
 * the tab order.
 *
 * Controlled by design — the caller owns `value` so tab state can live wherever
 * it needs to (URL, store, local state).
 */
export function Tabs({
  items,
  value,
  onValueChange,
  variant = "underline",
  color = "primary",
  size = "md",
  label,
  idPrefix,
  className = "",
  ...props
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const focusTab = useCallback((index: number) => {
    const tabs = listRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]:not([disabled])',
    );
    if (!tabs || tabs.length === 0) return;
    const target = tabs[(index + tabs.length) % tabs.length];
    target?.focus();
    target?.click();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const tabs = Array.from(
      listRef.current?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([disabled])',
      ) ?? [],
    );
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab(current + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab(current - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(tabs.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className={cn("flex items-center overflow-x-auto", listRecipe[variant])}
      >
        {items.map((item) => {
          const isActive = item.value === value;
          return (
            <button
              key={item.value}
              id={idPrefix ? `${idPrefix}-tab-${item.value}` : undefined}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={
                idPrefix ? `${idPrefix}-panel-${item.value}` : undefined
              }
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => onValueChange(item.value)}
              className={cn(
                "shrink-0 font-medium whitespace-nowrap",
                "disabled:cursor-not-allowed disabled:opacity-50",
                controlMotion,
                focusRing,
                ringRecipe[color],
                sizeRecipe[size],
                shapeRecipe[variant],
                isActive
                  ? activeRecipe[variant][color]
                  : inactiveRecipe[variant],
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Must match the `value` of the tab that controls this panel. */
  value: string;
  activeValue: string;
  /** Same prefix passed to the sibling `<Tabs>`, if any. */
  idPrefix?: string;
}

export function TabPanel({
  value,
  activeValue,
  idPrefix,
  className = "",
  children,
  ...props
}: TabPanelProps) {
  if (value !== activeValue) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      id={idPrefix ? `${idPrefix}-panel-${value}` : undefined}
      aria-labelledby={idPrefix ? `${idPrefix}-tab-${value}` : undefined}
      className={cn("pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
