# Design System

A single source of truth for colour, spacing, type, elevation and motion, plus
one component API that every UI primitive implements.

## Where things live

| What | Where |
| --- | --- |
| Token values (the source of truth) | `src/app/globals.css` |
| TypeScript mirror of the tokens | `src/design-system/tokens.ts` |
| Shared prop vocabulary | `src/design-system/types.ts` |
| Shared class recipes | `src/design-system/recipes.ts` |
| UI primitives | `src/components/ui/` |

There is no `tailwind.config.*`. The project is on Tailwind v4, which reads its
theme from CSS — a JS config is only loaded when a stylesheet explicitly
`@config`s it, and nothing did. Keeping a config file that generated no
utilities was the main reason tokens drifted, so it was removed and everything
now flows from `globals.css`.

## The three axes

Every primitive that paints a coloured surface takes the same three props:

| Prop | Question it answers | Values |
| --- | --- | --- |
| `variant` | How much emphasis? | `solid`, `soft`, `outline`, `ghost`, `link` |
| `color` | What does it mean? | `primary`, `secondary`, `success`, `warning`, `error`, `info`, `neutral` |
| `size` | How much room? | `xs`, `sm`, `md`, `lg`, `xl` (fields use `sm`/`md`/`lg`) |

```tsx
<Button variant="soft" color="error">Cancel policy</Button>
<Badge  variant="soft" color="error">Lapsed</Badge>
```

Because both read the same recipe, they are tinted identically. Keeping the
axes orthogonal is the whole point — a variant never implies a colour.

### Legacy names still work

Call sites written before the design system pass a variant that encoded both
axes (`variant="danger"`, `variant="primary"`, …). `resolveLegacyVariant`
normalises those, so nothing had to be rewritten in one pass:

| Legacy | Resolves to |
| --- | --- |
| `primary` | `variant="solid" color="primary"` |
| `secondary` | `variant="solid" color="neutral"` |
| `danger` | `variant="solid" color="error"` |
| `default` (Card) | `variant="solid"`, elevation 1 |
| `elevated` (Card) | `variant="solid"`, elevation 3 |

An explicit `color` always wins over the one the legacy variant implies.

## Tokens

### Colour

Each semantic colour ships five roles, so a component never has to special-case
a palette:

| Token | Use |
| --- | --- |
| `--ds-<name>` | solid fill / emphasis |
| `--ds-<name>-hover` | solid fill, hovered |
| `--ds-<name>-fg` | text or icon **on** the solid fill |
| `--ds-<name>-soft` | tinted fill for low-emphasis surfaces |
| `--ds-<name>-on-soft` | text or icon on the tinted fill |

Surfaces are `surface`, `surface-raised`, `surface-sunken`, `surface-overlay`,
`surface-inverse`. Foreground is `fg`, `fg-muted`, `fg-subtle`, `fg-inverse`.
Borders are `border`, `border-subtle`, `border-strong`.

They are exposed as Tailwind utilities: `bg-primary`, `text-primary-fg`,
`bg-error-soft`, `text-fg-muted`, `border-border-strong`, and so on.

**Contrast.** Every foreground/background pair above meets WCAG AA (>= 4.5:1) in
both themes; the measured ratios are noted inline in `globals.css`. Light mode
uses the darker end of each ramp (`sky-700`, `green-700`, …) and dark mode the
lighter end (`sky-400`, `green-400`, …).

### Spacing

4px base. Canonical steps: `0 1 2 3 4 5 6 8 10 12 16 20 24`. Anything outside
that list is a bug, not a decision.

### Type

`2xs xs sm base lg xl 2xl 3xl 4xl 5xl 6xl`, each with a paired line height and,
at the display sizes, a tightened letter spacing. `font-display` is the Inter
face used for marketing headings; `font-sans` is the default.

### Radius

Named by role rather than by size: `rounded-field` (inputs), `rounded-control`
(buttons, chips), `rounded-card`, `rounded-surface` (modals), `rounded-pill`.

### Elevation

`shadow-elevation-0` through `shadow-elevation-4`. The ramp is theme-aware —
dark mode uses deeper, more opaque shadows because a subtle light-mode shadow
is invisible against a near-black surface.

### Motion

Durations: 75 / 150 / 200 / 300 / 500 ms, as `--ds-duration-*`.
Curves: `ease-standard` (almost everything), `ease-emphasized` (slight
overshoot on entry), `ease-entrance`, `ease-exit`.

`prefers-reduced-motion: reduce` collapses animations and transitions globally,
and the primitives additionally drop their transform effects via
`motion-reduce:`.

## Dark mode

`ThemeProvider` toggles a `.dark` class on `<html>`. Tailwind v4 defaults the
`dark:` variant to `prefers-color-scheme`, so `globals.css` redefines it:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Without that line every `dark:` utility in the app followed the OS setting and
ignored the in-app theme toggle.

Because the semantic tokens are redefined under `.dark`, most components need
no `dark:` variants at all — `bg-surface-raised text-fg` is correct in both
themes. Reach for `dark:` only when a component genuinely needs a different
*structure* in dark mode, not just different values.

## Adding a component

1. Take `variant` / `color` / `size` if the component paints a coloured surface.
2. Build the class list with `cn()` and the recipes from
   `src/design-system/recipes.ts` — do not hand-write colour classes.
3. Put the caller's `className` last so it can still override.
4. Use `focusRing` + `ringRecipe[color]` for anything focusable, and
   `controlMotion` for anything that transitions.
5. Export it from `src/components/ui/index.ts`.

Class strings in the recipes are written out in full on purpose: Tailwind scans
source text, so a template-built `` `bg-${color}` `` silently generates nothing.
