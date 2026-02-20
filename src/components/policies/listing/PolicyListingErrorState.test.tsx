import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PolicyListingErrorState } from './PolicyListingErrorState';

describe('PolicyListingErrorState', () => {
  it('renders error message', () => {
    render(<PolicyListingErrorState message="Failed to load" onRetry={jest.fn()} />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', async () => {
    const user = userEvent.setup();
    const mockRetry = jest.fn();
    
    render(<PolicyListingErrorState message="Error" onRetry={mockRetry} />);
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);
    
    expect(mockRetry).toHaveBeenCalled();
  });
});
