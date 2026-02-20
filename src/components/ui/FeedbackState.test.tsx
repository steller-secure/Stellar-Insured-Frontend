import { render, screen } from '@testing-library/react';
import { FeedbackState } from './FeedbackState';

describe('FeedbackState', () => {
  it('renders loading state', () => {
    render(<FeedbackState variant="loading" />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders loading state with custom message', () => {
    render(<FeedbackState variant="loading" title="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<FeedbackState variant="error" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<FeedbackState variant="empty" />);
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument();
  });

  it('renders custom description', () => {
    render(<FeedbackState variant="error" description="Custom error message" />);
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });
});
