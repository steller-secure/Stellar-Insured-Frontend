import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PolicyListingCard } from './PolicyListingCard';
import type { PolicyCategoryWithLayout } from '@/types/policies/policy-listing';

const mockItem: PolicyCategoryWithLayout = {
  id: 'health',
  title: 'Health Insurance',
  description: 'Comprehensive health coverage',
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
};

describe('PolicyListingCard', () => {
  it('renders policy title', () => {
    render(<PolicyListingCard item={mockItem} onLearnMore={jest.fn()} />);
    expect(screen.getByText('Health Insurance')).toBeInTheDocument();
  });

  it('renders learn more button', () => {
    render(<PolicyListingCard item={mockItem} onLearnMore={jest.fn()} />);
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('calls onLearnMore when button clicked', async () => {
    const user = userEvent.setup();
    const mockLearnMore = jest.fn();
    
    render(<PolicyListingCard item={mockItem} onLearnMore={mockLearnMore} />);
    
    const button = screen.getByText('Learn More');
    await user.click(button);
    
    expect(mockLearnMore).toHaveBeenCalledWith(mockItem);
  });
});
