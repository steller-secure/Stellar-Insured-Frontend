import {
  cn,
  resolveLegacyVariant,
  staticSurfaceRecipe,
  surfaceRecipe,
} from '@/design-system';
import type { UIColor, UIVariant } from '@/design-system';

const VARIANTS: UIVariant[] = ['solid', 'soft', 'outline', 'ghost', 'link'];
const COLORS: UIColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
  'neutral',
];

describe('cn', () => {
  it('drops falsy values and flattens nested input', () => {
    expect(cn('a', null, undefined, false, ['b', ['c']], { d: true, e: false })).toBe(
      'a b c d',
    );
  });

  it('keeps the caller-supplied classes last so they win', () => {
    expect(cn('bg-primary', 'bg-error')).toBe('bg-primary bg-error');
  });
});

describe('surfaceRecipe', () => {
  it('covers every variant/colour pair', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        expect(surfaceRecipe[variant][color]).toBeTruthy();
      }
    }
  });

  it('pairs every solid fill with its matching on-colour foreground', () => {
    for (const color of COLORS) {
      expect(surfaceRecipe.solid[color]).toContain(`bg-${color}`);
      expect(surfaceRecipe.solid[color]).toContain(`text-${color}-fg`);
    }
  });

  it('strips hover treatment from the static variant only', () => {
    for (const variant of VARIANTS) {
      for (const color of COLORS) {
        expect(staticSurfaceRecipe[variant][color]).not.toContain('hover:');
      }
    }

    expect(surfaceRecipe.solid.primary).toContain('hover:');
  });
});

describe('resolveLegacyVariant', () => {
  const fallback = { variant: 'solid' as UIVariant, color: 'primary' as UIColor };

  it('falls back when no variant is given', () => {
    expect(resolveLegacyVariant(undefined, undefined, fallback)).toEqual(fallback);
  });

  it('translates the pre-token names', () => {
    expect(resolveLegacyVariant('danger', undefined, fallback)).toEqual({
      variant: 'solid',
      color: 'error',
    });
    expect(resolveLegacyVariant('secondary', undefined, fallback)).toEqual({
      variant: 'solid',
      color: 'neutral',
    });
  });

  it('passes current variant names straight through', () => {
    expect(resolveLegacyVariant('outline', 'success', fallback)).toEqual({
      variant: 'outline',
      color: 'success',
    });
  });

  it('lets an explicit colour win over the legacy variant', () => {
    expect(resolveLegacyVariant('danger', 'info', fallback)).toEqual({
      variant: 'solid',
      color: 'info',
    });
  });

  it('falls back on an unknown variant rather than rendering nothing', () => {
    expect(
      resolveLegacyVariant('nonsense' as UIVariant, undefined, fallback),
    ).toEqual(fallback);
  });
});
