/**
 * Accessibility tests for NotificationContext / NotificationProvider.
 * Uses jest-axe to verify the aria-live regions comply with WCAG 2.1 AA.
 *
 * WCAG references:
 *   4.1.3  Status Messages – status messages must be determinable via
 *          role or property so AT can announce them without receiving focus.
 *   1.3.1  Info and Relationships – role="status" / role="alert" semantics.
 */
import React from 'react';
import { render, act, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// ── Module mocks ───────────────────────────────────────────────────────────────

const showToastMock = jest.fn();

jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

import { NotificationProvider, useNotificationContext } from '../NotificationContext';

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Renders <NotificationProvider> with optional children and returns both the
 *  container and the context value exposed by a child component. */
const setup = (children?: React.ReactNode) =>
  render(
    <NotificationProvider>
      {children ?? <div data-testid="content">Content</div>}
    </NotificationProvider>,
  );

// ── Accessibility tests ────────────────────────────────────────────────────────

describe('NotificationProvider – accessibility (jest-axe)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has no violations when rendered with no announcement', async () => {
    const { container } = setup();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations after an announcement is made (aria-live="polite")', async () => {
    let announcer: ReturnType<typeof useNotificationContext>;

    const Probe = () => {
      announcer = useNotificationContext();
      return null;
    };

    const { container } = setup(<Probe />);

    act(() => {
      announcer.announce('Claim status updated to Approved.');
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations after addNotification is called (success)', async () => {
    let ctx: ReturnType<typeof useNotificationContext>;

    const Probe = () => {
      ctx = useNotificationContext();
      return null;
    };

    const { container } = setup(<Probe />);

    act(() => {
      ctx.addNotification('Policy created successfully.', 'success');
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations after addNotification is called (error)', async () => {
    let ctx: ReturnType<typeof useNotificationContext>;

    const Probe = () => {
      ctx = useNotificationContext();
      return null;
    };

    const { container } = setup(<Probe />);

    act(() => {
      ctx.addNotification('Failed to submit claim. Please try again.', 'error');
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders a polite aria-live status region', () => {
    setup();
    const statusRegion = document.querySelector('[role="status"][aria-live="polite"]');
    expect(statusRegion).toBeInTheDocument();
    expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('renders an assertive aria-live alert region', () => {
    setup();
    const alertRegion = document.querySelector('[role="alert"][aria-live="assertive"]');
    expect(alertRegion).toBeInTheDocument();
    expect(alertRegion).toHaveAttribute('aria-atomic', 'true');
  });
});
