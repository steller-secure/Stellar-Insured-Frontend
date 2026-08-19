/**
 * Shared class recipes.
 *
 * Every primitive that paints a coloured surface builds its class list from
 * these maps, so a `soft` `error` button and a `soft` `error` badge are tinted
 * by the same tokens. Class strings are written out in full on purpose:
 * Tailwind scans source text, so a template-built `bg-${color}` would silently
 * produce nothing.
 */

import type {
  AnyVariant,
  UIColor,
  UIElevation,
  UIFieldSize,
  UIFieldState,
  UISize,
  UIVariant,
} from "./types";

/** Applied to every focusable control so focus looks identical everywhere. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/** Applied to every control that animates, so timing is identical everywhere. */
export const controlMotion = "transition-colors duration-200 ease-standard";

export const disabledControl =
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

/**
 * `variant` x `color` -> surface classes.
 *
 * - `solid`   — the loudest option. Filled with the colour, text in `-fg`.
 * - `soft`    — tinted background, text in `-on-soft`. The default for status.
 * - `outline` — hairline border in the colour, transparent fill.
 * - `ghost`   — no chrome until hovered.
 * - `link`    — text only, underlined on hover.
 */
export const surfaceRecipe: Record<UIVariant, Record<UIColor, string>> = {
  solid: {
    primary: "bg-primary text-primary-fg hover:bg-primary-hover",
    secondary: "bg-secondary text-secondary-fg hover:bg-secondary-hover",
    success: "bg-success text-success-fg hover:bg-success-hover",
    warning: "bg-warning text-warning-fg hover:bg-warning-hover",
    error: "bg-error text-error-fg hover:bg-error-hover",
    info: "bg-info text-info-fg hover:bg-info-hover",
    neutral: "bg-neutral text-neutral-fg hover:bg-neutral-hover",
  },
  soft: {
    primary: "bg-primary-soft text-primary-on-soft hover:bg-primary/20",
    secondary: "bg-secondary-soft text-secondary-on-soft hover:bg-secondary/20",
    success: "bg-success-soft text-success-on-soft hover:bg-success/20",
    warning: "bg-warning-soft text-warning-on-soft hover:bg-warning/20",
    error: "bg-error-soft text-error-on-soft hover:bg-error/20",
    info: "bg-info-soft text-info-on-soft hover:bg-info/20",
    neutral: "bg-neutral-soft text-neutral-on-soft hover:bg-neutral/20",
  },
  outline: {
    primary: "border border-primary text-primary hover:bg-primary/10",
    secondary: "border border-secondary text-secondary hover:bg-secondary/10",
    success: "border border-success text-success hover:bg-success/10",
    warning: "border border-warning text-warning hover:bg-warning/10",
    error: "border border-error text-error hover:bg-error/10",
    info: "border border-info text-info hover:bg-info/10",
    neutral: "border border-border-strong text-fg hover:bg-neutral/10",
  },
  ghost: {
    primary: "text-primary hover:bg-primary/10",
    secondary: "text-secondary hover:bg-secondary/10",
    success: "text-success hover:bg-success/10",
    warning: "text-warning hover:bg-warning/10",
    error: "text-error hover:bg-error/10",
    info: "text-info hover:bg-info/10",
    neutral: "text-fg-muted hover:bg-neutral/10 hover:text-fg",
  },
  link: {
    primary: "text-primary hover:text-primary-hover",
    secondary: "text-secondary hover:text-secondary-hover",
    success: "text-success hover:text-success-hover",
    warning: "text-warning hover:text-warning-hover",
    error: "text-error hover:text-error-hover",
    info: "text-info hover:text-info-hover",
    neutral: "text-fg hover:text-fg-muted",
  },
};

/**
 * The same surfaces with their hover treatment stripped, for things that are
 * painted but not interactive (badges, alerts, status chips).
 */
export const staticSurfaceRecipe: Record<UIVariant, Record<UIColor, string>> =
  Object.fromEntries(
    Object.entries(surfaceRecipe).map(([variant, colors]) => [
      variant,
      Object.fromEntries(
        Object.entries(colors).map(([name, classes]) => [
          name,
          classes
            .split(" ")
            .filter((token) => !token.startsWith("hover:"))
            .join(" "),
        ]),
      ),
    ]),
  ) as Record<UIVariant, Record<UIColor, string>>;

/** Focus ring colour per semantic colour. */
export const ringRecipe: Record<UIColor, string> = {
  primary: "focus-visible:ring-primary",
  secondary: "focus-visible:ring-secondary",
  success: "focus-visible:ring-success",
  warning: "focus-visible:ring-warning",
  error: "focus-visible:ring-error",
  info: "focus-visible:ring-info",
  neutral: "focus-visible:ring-border-strong",
};

/** Control density: height, horizontal padding, type step, icon gap, radius. */
export const controlSizeRecipe: Record<UISize, string> = {
  xs: "h-7 gap-1 rounded-field px-2.5 text-2xs",
  sm: "h-9 gap-1.5 rounded-field px-3 text-sm",
  md: "h-11 gap-2 rounded-control px-4 text-sm",
  lg: "h-12 gap-2 rounded-control px-6 text-base",
  xl: "h-14 gap-2.5 rounded-control px-8 text-lg",
};

/** Square controls (icon-only buttons) reuse the control heights. */
export const iconControlSizeRecipe: Record<UISize, string> = {
  xs: "h-7 w-7 rounded-field text-2xs",
  sm: "h-9 w-9 rounded-field text-sm",
  md: "h-11 w-11 rounded-control text-sm",
  lg: "h-12 w-12 rounded-control text-base",
  xl: "h-14 w-14 rounded-control text-lg",
};

/** Badge density. Badges never take the full control scale. */
export const badgeSizeRecipe: Record<UIFieldSize, string> = {
  sm: "gap-1 px-2 py-0.5 text-2xs",
  md: "gap-1.5 px-2.5 py-1 text-xs",
  lg: "gap-2 px-3 py-1.5 text-sm",
};

/** Form field density. */
export const fieldSizeRecipe: Record<UIFieldSize, string> = {
  sm: "rounded-field px-3 py-2 text-sm",
  md: "rounded-field px-4 py-2.5 text-sm",
  lg: "rounded-control px-4 py-3 text-base",
};

/** Validation chrome for form fields. */
export const fieldStateRecipe: Record<UIFieldState, string> = {
  default:
    "border-border hover:border-border-strong focus:border-primary focus:ring-primary",
  success: "border-success focus:border-success focus:ring-success",
  error: "border-error focus:border-error focus:ring-error",
};

/** Elevation ramp. */
export const elevationRecipe: Record<UIElevation, string> = {
  0: "shadow-elevation-0",
  1: "shadow-elevation-1",
  2: "shadow-elevation-2",
  3: "shadow-elevation-3",
  4: "shadow-elevation-4",
};

/** Padding ramp for container surfaces (cards, panels, modal bodies). */
export const surfacePaddingRecipe = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export type SurfacePadding = keyof typeof surfacePaddingRecipe;

const LEGACY_VARIANTS: Record<string, { variant: UIVariant; color: UIColor }> = {
  // Pre-token button names.
  primary: { variant: "solid", color: "primary" },
  secondary: { variant: "solid", color: "neutral" },
  danger: { variant: "solid", color: "error" },
  // Pre-token card names.
  default: { variant: "solid", color: "neutral" },
  elevated: { variant: "solid", color: "neutral" },
};

const UI_VARIANTS: readonly UIVariant[] = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "link",
];

/**
 * Normalises the `variant` prop into a `{ variant, color }` pair.
 *
 * Call sites written before the design system pass a variant that encoded both
 * axes at once (`"danger"`, `"primary"`, …). Those keep working and resolve to
 * the equivalent pair; an explicit `color` prop always wins.
 */
export function resolveLegacyVariant(
  variant: AnyVariant | undefined,
  color: UIColor | undefined,
  fallback: { variant: UIVariant; color: UIColor },
): { variant: UIVariant; color: UIColor } {
  if (!variant) {
    return { variant: fallback.variant, color: color ?? fallback.color };
  }

  if (UI_VARIANTS.includes(variant as UIVariant)) {
    return { variant: variant as UIVariant, color: color ?? fallback.color };
  }

  const legacy = LEGACY_VARIANTS[variant];
  if (legacy) {
    return { variant: legacy.variant, color: color ?? legacy.color };
  }

  return { variant: fallback.variant, color: color ?? fallback.color };
}
