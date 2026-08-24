/**
 * Accessibility tests for MyPoliciesPage component.
 * Uses jest-axe to automatically detect WCAG 2.1 AA violations.
 *
 * WCAG references:
 *   1.1.1  Non-text Content (decorative icons aria-hidden)
 *   1.3.1  Info and Relationships (tab widget, list, headings)
 *   2.1.1  Keyboard (tab buttons, New Policy button)
 *   2.4.6  Headings and Labels (search input label)
 *   4.1.2  Name, Role, Value (role=tablist/tab/tabpanel, aria-selected)
 */
import React from 'react';
import { waitFor } from '@testing-library/react';
import { renderWithQueryClient as render } from '@/test-utils/renderWithQueryClient';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// ── Module mocks ───────────────────────────────────────────────────────────────

// Stub ProtectedRoute so the component renders without auth
jest.mock('@/components/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Stub ErrorBoundary
jest.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Provide wallet state
jest.mock('@/hooks/useWallet', () => ({
  useWallet: jest.fn(() => ({ isConnected: false })),
}));

// Analytics stub
jest.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({ trackAction: jest.fn() }),
}));

// Stub policy service
jest.mock('@/services/policyService', () => ({
  policyService: {
    getPolicies: jest.fn().mockResolvedValue({
      success: true,
      data: {
        policies: [
          {
            id: 'pol-1',
            name: 'Crypto Wallet Protection',
            policyNumber: 'POL-001',
            type: 'Crypto',
            status: 'active',
            premium: 50,
            premiumFormatted: '$50/mo',
            coverageLimit: 50000,
            coverageLimitFormatted: '$50,000',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            description: 'Protects your crypto wallet.',
          },
        ],
      },
    }),
  },
}));

// Stub sub-components that have external dependencies
jest.mock('@/components/WalletConnectButton', () => ({
  WalletConnectButton: ({ showBalance }: { showBalance?: boolean }) => (
    <button type="button">Connect Wallet</button>
  ),
}));

jest.mock('@/components/WalletStatus', () => ({
  WalletStatus: () => <div>Wallet connected</div>,
}));

jest.mock('@/components/FilterDropdown', () => ({
  FilterDropdown: ({ placeholder }: { placeholder: string }) => (
    <button type="button" aria-label={placeholder}>
      {placeholder}
    </button>
  ),
}));

jest.mock('@/components/Pagination', () => ({
  Pagination: () => <nav aria-label="Pagination">Pagination</nav>,
}));

jest.mock('@/components/policies/PolicyCard', () => ({
  PolicyCard: ({ policy }: { policy: { name: string } }) => (
    <article aria-label={policy.name}>{policy.name}</article>
  ),
}));

jest.mock('@/components/ui/SkeletonLoaders', () => ({
  PolicyCardSkeleton: () => <div aria-busy="true">Loading…</div>,
  EmptyState: ({ title }: { title: string }) => <p>{title}</p>,
  ErrorState: ({ title }: { title: string }) => <p role="alert">{title}</p>,
}));

import MyPoliciesPage from '../MyPoliciesPage';

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('MyPoliciesPage – accessibility (jest-axe)', () => {
  it('has no violations in the default unauthenticated state', async () => {
    const { container, getByText } = render(<MyPoliciesPage />);
    await waitFor(() => getByText('Crypto Wallet Protection'));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when wallet is connected', async () => {
    const { useWallet } = require('@/hooks/useWallet');
    (useWallet as jest.Mock).mockReturnValue({ isConnected: true });

    const { container, getByText } = render(<MyPoliciesPage />);
    await waitFor(() => getByText('Crypto Wallet Protection'));
    expect(await axe(container)).toHaveNoViolations();
  });
});
