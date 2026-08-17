/**
 * TypeScript mirror of the design tokens declared in `src/app/globals.css`.
 *
 * The CSS file is the source of truth for *values*; this file exists so code
 * that cannot use a class name (inline styles, canvas, chart libraries, tests)
 * can still reach the same scale instead of inventing a new one. Every entry
 * here either restates a canonical step or points at the CSS custom property
 * that carries the themed value.
 */

/**
 * Canonical spacing scale. 4px base — the same steps Tailwind emits from
 * `--spacing`. Anything outside this list is a bug, not a decision.
 */
export const spacing = {
  0: "0rem",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;

/** Canonical type scale: font size paired with its line height. */
export const typography = {
  "2xs": { fontSize: "0.6875rem", lineHeight: "1rem" },
  xs: { fontSize: "0.75rem", lineHeight: "1rem" },
  sm: { fontSize: "0.875rem", lineHeight: "1.25rem" },
  base: { fontSize: "1rem", lineHeight: "1.5rem" },
  lg: { fontSize: "1.125rem", lineHeight: "1.75rem" },
  xl: { fontSize: "1.25rem", lineHeight: "1.75rem" },
  "2xl": { fontSize: "1.5rem", lineHeight: "2rem" },
  "3xl": { fontSize: "1.875rem", lineHeight: "2.25rem" },
  "4xl": { fontSize: "2.25rem", lineHeight: "2.5rem" },
  "5xl": { fontSize: "3rem", lineHeight: "1.1" },
  "6xl": { fontSize: "3.75rem", lineHeight: "1.05" },
} as const;

/** Corner radii, keyed by the role of the surface rather than by size. */
export const radius = {
  field: "0.5rem",
  control: "0.75rem",
  card: "1rem",
  surface: "1.5rem",
  pill: "9999px",
} as const;

/**
 * Themed colour tokens, as `var()` references so they follow the active theme.
 * Use the Tailwind utilities (`bg-primary`, `text-fg-muted`, …) wherever a
 * class name is possible; these are for the cases where it is not.
 */
export const color = {
  surface: "var(--ds-surface)",
  surfaceRaised: "var(--ds-surface-raised)",
  surfaceSunken: "var(--ds-surface-sunken)",
  surfaceOverlay: "var(--ds-surface-overlay)",
  surfaceInverse: "var(--ds-surface-inverse)",
  scrim: "var(--ds-scrim)",

  fg: "var(--ds-fg)",
  fgMuted: "var(--ds-fg-muted)",
  fgSubtle: "var(--ds-fg-subtle)",
  fgInverse: "var(--ds-fg-inverse)",

  border: "var(--ds-border)",
  borderSubtle: "var(--ds-border-subtle)",
  borderStrong: "var(--ds-border-strong)",

  primary: "var(--ds-primary)",
  secondary: "var(--ds-secondary)",
  success: "var(--ds-success)",
  warning: "var(--ds-warning)",
  error: "var(--ds-error)",
  info: "var(--ds-info)",
  neutral: "var(--ds-neutral)",

  ring: "var(--ds-ring)",
} as const;

/** Elevation ramp. Index matches the `shadow-elevation-*` utilities. */
export const elevation = [
  "var(--ds-elevation-0)",
  "var(--ds-elevation-1)",
  "var(--ds-elevation-2)",
  "var(--ds-elevation-3)",
  "var(--ds-elevation-4)",
] as const;

/**
 * Motion. `standard` covers almost everything; reach for `emphasized` only
 * when an element should feel like it overshoots slightly on entry.
 */
export const motion = {
  duration: {
    instant: 75,
    fast: 150,
    normal: 200,
    slow: 300,
    deliberate: 500,
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.2, 0, 0, 1.2)",
    entrance: "cubic-bezier(0, 0, 0, 1)",
    exit: "cubic-bezier(0.3, 0, 1, 1)",
  },
} as const;

/** Z-index ladder, so overlays stop fighting over arbitrary numbers. */
export const zIndex = {
  base: 0,
  sticky: 10,
  header: 30,
  drawer: 40,
  modal: 50,
  popover: 60,
  toast: 70,
} as const;

export type SpacingStep = keyof typeof spacing;
export type TypeStep = keyof typeof typography;
export type RadiusStep = keyof typeof radius;
