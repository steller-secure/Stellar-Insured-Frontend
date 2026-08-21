/**
 * Accessibility tests for src/components/claims/ components.
 * Uses jest-axe to automatically detect WCAG 2.1 AA violations.
 *
 * WCAG references:
 *   1.1.1  Non-text Content (decorative icons aria-hidden)
 *   1.3.1  Info and Relationships (lists, headings)
 *   2.1.1  Keyboard (claim card buttons)
 *   2.4.6  Headings and Labels
 *   3.3.1  Error Identification
 *   4.1.2  Name, Role, Value
 *   4.1.3  Status Messages (aria-live regions)
 */
import React from 'react';
import { waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithQueryClient } from '@/test-utils/renderWithQueryClient';

expect.extend(toHaveNoViolations);

// ─── Mocks ─────────────────────────────────────────────────────────────────────

const MOCK_CLAIMS = [
  {
    id: 'CLM-2026-0001',
    policyName: 'Crypto Wallet Protection',
    status: 'Pending',
    amountFormatted: '$5,000',
    dateFiled: '2026-07-15',
    incidentType: 'Wallet Hack',
    description: 'Unauthorised access to my crypto wallet resulted in a full drain.',
  },
  {
    id: 'CLM-2026-0002',
    policyName: 'Health Shield Plus',
    status: 'Approved',
    amountFormatted: '$2,500',
    dateFiled: '2026-06-20',
    incidentType: 'Medical Emergency',
    description: 'Emergency hospital visit.',
  },
  {
    id: 'CLM-2026-0003',
    policyName: 'Vehicle Cover',
    status: 'Rejected',
    amountFormatted: '$1,200',
    dateFiled: '2026-05-10',
    incidentType: 'Collision',
    description: 'Minor collision at intersection.',
  },
  {
    id: 'CLM-2026-0004',
    policyName: 'Property Guard',
    status: 'Active',
    amountFormatted: '$8,000',
    dateFiled: '2026-08-01',
    incidentType: 'Fire Damage',
    description: 'Partial fire damage to property.',
  },
];

jest.mock('@/config/dataSource', () => ({
  DataService: {
    getClaims: jest.fn().mockResolvedValue(MOCK_CLAIMS),
  },
}));

import { ClaimTrackingDashboard } from '../ClaimTrackingDashboard';

// ─── ClaimTrackingDashboard ───────────────────────────────────────────────────

describe('ClaimTrackingDashboard – accessibility (jest-axe)', () => {
  it('has no violations in default state (with search, no claim selected)', async () => {
    const { container, getByText } = renderWithQueryClient(<ClaimTrackingDashboard />);
    await waitFor(() => getByText('Crypto Wallet Protection'));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations without search bar', async () => {
    const { container, getByText } = renderWithQueryClient(
      <ClaimTrackingDashboard showSearch={false} />
    );
    await waitFor(() => getByText('Crypto Wallet Protection'));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations when maxClaims limits the list', async () => {
    const { container, getByText } = renderWithQueryClient(
      <ClaimTrackingDashboard maxClaims={2} />
    );
    await waitFor(() => getByText('Crypto Wallet Protection'));
    expect(await axe(container)).toHaveNoViolations();
  });
});
