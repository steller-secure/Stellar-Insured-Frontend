import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PolicyListingScreen } from './PolicyListingScreen';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

describe('PolicyListingScreen', () => {
  it('renders loading state initially', () => {
    render(<PolicyListingScreen />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders policy categories after loading', async () => {
    render(<PolicyListingScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Insurance Categories')).toBeInTheDocument();
    });
  });

  it('displays category description', async () => {
    render(<PolicyListingScreen />);
    
    await waitFor(() => {
      expect(screen.getByText(/We offer a wide range of insurance products/i)).toBeInTheDocument();
    });
  });
});
