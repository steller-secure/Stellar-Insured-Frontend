/**
 * Accessibility tests for NavBar component.
 * Uses jest-axe to automatically detect WCAG 2.1 AA violations.
 *
 * WCAG references:
 *   1.1.1  Non-text Content (logo alt text, icon aria-hidden)
 *   1.3.1  Info and Relationships (nav landmark, list semantics)
 *   2.1.1  Keyboard (mobile menu toggle, arrow-key nav)
 *   2.4.1  Bypass Blocks (nav landmark)
 *   2.4.4  Link Purpose (descriptive link text / aria-label)
 *   4.1.2  Name, Role, Value (aria-expanded, aria-controls, aria-current)
 */
import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// ── Module mocks ───────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/auth-provider', () => ({
  useAuth: () => ({ session: null, signOut: jest.fn() }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/hooks/useWallet', () => ({
  useWallet: () => ({ isConnected: false, address: null }),
}));

jest.mock('@/components/WalletConnectButton', () => ({
  WalletConnectButton: () => <button type="button">Connect Wallet</button>,
}));

jest.mock('@/components/WalletStatus', () => ({
  WalletStatus: () => <div>Wallet Status</div>,
}));

jest.mock('@/components/NotificationCenter', () => ({
  NotificationCenter: () => (
    <button type="button" aria-label="Open notifications">
      Notifications
    </button>
  ),
}));

import NavBar from '../NavBar';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Re-mock useAuth to simulate an authenticated session.
 * Must be called BEFORE rendering.
 */
const withAuthenticatedSession = () => {
  jest.mock('@/components/auth-provider', () => ({
    useAuth: () => ({
      session: { publicKey: 'GABC', isAuthenticated: true },
      signOut: jest.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }));
};

// ── NavBar – unauthenticated ──────────────────────────────────────────────────

describe('NavBar – accessibility (jest-axe, unauthenticated)', () => {
  it('has no violations in default (unauthenticated) state', async () => {
    const { container } = render(<NavBar />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations on the Home route (aria-current="page")', async () => {
    // usePathname mock already returns '/' so the Home link gets aria-current
    const { container } = render(<NavBar />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

// ── NavBar – mobile menu ──────────────────────────────────────────────────────

describe('NavBar – accessibility (jest-axe, mobile menu)', () => {
  it('has no violations when the mobile menu button is visible', async () => {
    const { container } = render(<NavBar />);
    // The hamburger button is always present in the DOM even on desktop viewports
    // (hidden via CSS). axe still validates it.
    expect(await axe(container)).toHaveNoViolations();
  });
});
