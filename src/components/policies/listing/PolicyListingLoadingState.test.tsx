import { render, screen } from '@testing-library/react';
import { PolicyListingLoadingState } from './PolicyListingLoadingState';

describe('PolicyListingLoadingState', () => {
  it('renders loading indicator', () => {
    render(<PolicyListingLoadingState />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
