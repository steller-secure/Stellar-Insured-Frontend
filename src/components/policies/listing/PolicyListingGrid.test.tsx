import { render, screen } from '@testing-library/react';
import { PolicyListingGrid } from './PolicyListingGrid';
import type { PolicyCategoryWithLayout } from '@/types/policies/policy-listing';

const mockItems: PolicyCategoryWithLayout[] = [
  {
    id: 'health',
    title: 'Health Insurance',
    description: 'Medical coverage',
    icon: 'heart',
    layout: {
      leftPx: 0,
      topPx: 0,
      titleWidthClassName: 'w-full',
      titleLeftPx: 0,
      iconTileClassName: 'icon-tile',
      iconTilePaddingClassName: 'p-4',
      iconSizePx: 24,
    },
  },
  {
    id: 'vehicle',
    title: 'Auto Insurance',
    description: 'Vehicle coverage',
    icon: 'car',
    layout: {
      leftPx: 0,
      topPx: 0,
      titleWidthClassName: 'w-full',
      titleLeftPx: 0,
      iconTileClassName: 'icon-tile',
      iconTilePaddingClassName: 'p-4',
      iconSizePx: 24,
    },
  },
];

describe('PolicyListingGrid', () => {
  it('renders all policy items', () => {
    render(<PolicyListingGrid items={mockItems} onLearnMore={jest.fn()} />);
    expect(screen.getByText('Health Insurance')).toBeInTheDocument();
    expect(screen.getByText('Auto Insurance')).toBeInTheDocument();
  });

  it('renders learn more buttons', () => {
    render(<PolicyListingGrid items={mockItems} onLearnMore={jest.fn()} />);
    const buttons = screen.getAllByText('Learn More');
    expect(buttons).toHaveLength(2);
  });
});
