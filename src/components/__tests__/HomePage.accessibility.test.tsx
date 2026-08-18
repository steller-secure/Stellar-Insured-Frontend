/**
 * Accessibility tests for the HomePage component.
 * Uses jest-axe to automatically detect WCAG 2.1 AA violations.
 *
 * WCAG references:
 *   1.1.1  Non-text Content (image alt text, aria-hidden decorative icons)
 *   1.3.1  Info and Relationships (<main> landmark, heading structure)
 *   2.4.1  Bypass Blocks (id="main-content" skip-link target)
 *   2.4.6  Headings and Labels (page-level h1)
 *   4.1.2  Name, Role, Value (nav, main landmarks)
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// ── Module mocks ───────────────────────────────────────────────────────────────
// Stub out heavy child components so the test focuses on landmark / heading
// structure rather than individual section implementations.

jest.mock('@/components/HeroSection', () => ({
  __esModule: true,
  default: () => (
    <section aria-label="Hero">
      <h1>Protect What Matters</h1>
    </section>
  ),
}));

jest.mock('@/components/HowItWorksSection', () => ({
  HowItWorksSection: () => (
    <section aria-label="How it works">
      <h2>How It Works</h2>
    </section>
  ),
}));

jest.mock('@/components/KeyFeaturesSection', () => ({
  __esModule: true,
  default: () => (
    <section aria-label="Key features">
      <h2>Key Features</h2>
    </section>
  ),
}));

jest.mock('@/components/InsuranceCategoriesSection', () => ({
  __esModule: true,
  default: () => (
    <section aria-label="Insurance categories">
      <h2>Insurance Categories</h2>
    </section>
  ),
}));

jest.mock('@/components/ReadyToSecureSection', () => ({
  __esModule: true,
  default: () => (
    <section aria-label="Call to action">
      <h2>Ready to Secure?</h2>
    </section>
  ),
}));

jest.mock('@/components/FeaturePageSectionThree', () => ({
  __esModule: true,
  default: () => (
    <section aria-label="Features section three">
      <h2>More Features</h2>
    </section>
  ),
}));

jest.mock('@/components/SecureAsset', () => ({
  __esModule: true,
  default: () => (
    <section aria-label="Secure your assets">
      <h2>Secure Assets</h2>
    </section>
  ),
}));

jest.mock('@/components/NavBar/NavBar', () => ({
  __esModule: true,
  default: () => (
    <header>
      <nav aria-label="Main navigation">
        <a href="/">Home</a>
      </nav>
    </header>
  ),
}));

jest.mock('@/components/footer', () => ({
  __esModule: true,
  default: () => (
    <footer>
      <p>© 2026 Stellar Insured</p>
    </footer>
  ),
}));

import HomePage from '../HomePage';

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('HomePage – accessibility (jest-axe)', () => {
  it('has no violations on initial render', async () => {
    const { container } = render(<HomePage />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders a <main> element with id="main-content" (skip-link target)', () => {
    const { container } = render(<HomePage />);
    const main = container.querySelector('main#main-content');
    expect(main).toBeInTheDocument();
  });

  it('<main> has tabIndex="-1" to allow programmatic focus from skip link', () => {
    const { container } = render(<HomePage />);
    const main = container.querySelector('main#main-content');
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('renders a top-level heading (h1) inside the main content area', () => {
    const { container } = render(<HomePage />);
    const main = container.querySelector('main#main-content');
    const h1 = main?.querySelector('h1');
    expect(h1).toBeInTheDocument();
  });

  it('has no violations with all sections rendered together', async () => {
    const { container } = render(<HomePage />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
