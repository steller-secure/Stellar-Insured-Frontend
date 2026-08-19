/**
 * The shared vocabulary every UI primitive speaks.
 *
 * A component that renders a coloured surface takes `variant` + `color` +
 * `size` and nothing else. `variant` decides *how much emphasis* the surface
 * carries, `color` decides *what it means*, `size` decides *how much room it
 * takes*. Keeping those three axes orthogonal is what makes the primitives
 * composable — a `<Button variant="soft" color="error">` and a
 * `<Badge variant="soft" color="error">` are guaranteed to agree.
 */

/** How much visual emphasis a surface carries. */
export type UIVariant = "solid" | "soft" | "outline" | "ghost" | "link";

/** What a surface means. Maps 1:1 onto the semantic colour tokens. */
export type UIColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

/** How much room a control takes. */
export type UISize = "xs" | "sm" | "md" | "lg" | "xl";

/** Density steps for form fields, which need fewer options than controls. */
export type UIFieldSize = "sm" | "md" | "lg";

/** Elevation steps, matching the `shadow-elevation-*` utilities. */
export type UIElevation = 0 | 1 | 2 | 3 | 4;

/** Validation state shared by every form field. */
export type UIFieldState = "default" | "success" | "error";

/**
 * Variant names used before the design system landed. They are still accepted
 * by the primitives so existing call sites keep working, and are normalised to
 * a `{ variant, color }` pair by `resolveLegacyVariant`.
 */
export type LegacyVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "default"
  | "elevated";

/** Anything a primitive will accept for its `variant` prop. */
export type AnyVariant = UIVariant | LegacyVariant;
