/**
 * Accessibility tests for ErrorBoundary component.
 * Uses jest-axe to automatically detect WCAG 2.1 AA violations.
 *
 * WCAG references:
 *   1.3.1  Info and Relationships (role="alert", heading structure)
 *   2.1.1  Keyboard (Try Again, Refresh Page buttons)
 *   2.4.6  Headings and Labels (h2 inside error fallback)
 *   4.1.2  Name, Role, Value (role="alert", aria-live, aria-labelledby)
 *   4.1.3  Status Messages (assertive live region announces the error)
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// ── Module mocks ───────────────────────────────────────────────────────────────

// Stub analytics so tests don't attempt real HTTP calls
jest.mock('@/lib/analytics', () => ({
  analytics: {
    trackError: jest.fn(),
  },
}));

// Stub errorHandler
jest.mock('@/lib/errorHandler', () => ({
  errorHandler: {
    handleError: jest.fn(() => ({
      message: 'An unexpected error occurred',
      severity: 'HIGH',
      userActionable: false,
    })),
    sendToMonitoringEndpoint: jest.fn().mockResolvedValue(undefined),
  },
}));

import { ErrorBoundary } from '../ErrorBoundary';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** A component that always throws on render – used to trigger the boundary. */
const ThrowingComponent = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <div>No error</div>;
};

/**
 * Render an ErrorBoundary wrapping a component that throws.
 * jest swallows console.error from the boundary, keeping test output clean.
 */
const renderWithError = () => {
  // Suppress React's console.error for the expected boundary invocation
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const result = render(
    <ErrorBoundary>
      <ThrowingComponent />
    </ErrorBoundary>,
  );

  consoleSpy.mockRestore();
  return result;
};

// ── ErrorBoundary – fallback UI ────────────────────────────────────────────────

describe('ErrorBoundary – accessibility (jest-axe)', () => {
  it('has no violations when children render normally (no error)', async () => {
    const { container } = render(
      <ErrorBoundary>
        <div>
          <h1>Page content</h1>
          <p>Everything is fine.</p>
        </div>
      </ErrorBoundary>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in the error fallback UI', async () => {
    const { container } = renderWithError();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders an assertive aria-live region in error state', () => {
    renderWithError();
    // role="alert" + aria-live="assertive" (implicit on role=alert)
    const alertRegion = document.querySelector('[role="alert"]');
    expect(alertRegion).toBeInTheDocument();
  });

  it('error fallback heading is labelled via aria-labelledby', () => {
    renderWithError();
    const heading = screen.getByRole('heading', { name: /something went wrong/i });
    expect(heading).toBeInTheDocument();

    // The container div should reference the heading id via aria-labelledby
    const alertRegion = document.querySelector('[role="alert"]');
    const labelledById = alertRegion?.getAttribute('aria-labelledby');
    expect(labelledById).toBeTruthy();
    expect(document.getElementById(labelledById!)).toBe(heading);
  });

  it('renders "Try Again" and "Refresh Page" buttons', () => {
    renderWithError();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
  });

  it('has no violations with a custom fallback prop', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <ErrorBoundary fallback={<div role="alert">Custom error UI</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    consoleSpy.mockRestore();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when a custom onError handler is supplied', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onError = jest.fn();

    const { container } = render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    consoleSpy.mockRestore();
    expect(await axe(container)).toHaveNoViolations();
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
