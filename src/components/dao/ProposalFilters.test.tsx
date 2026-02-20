import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProposalFilters from './ProposalFilters';

describe('ProposalFilters', () => {
  it('renders search input', () => {
    render(
      <ProposalFilters
        searchQuery=""
        onSearchChange={jest.fn()}
        filter="all"
        onFilterChange={jest.fn()}
      />
    );
    expect(screen.getByPlaceholderText('Search proposals...')).toBeInTheDocument();
  });

  it('renders all filter buttons', () => {
    render(
      <ProposalFilters
        searchQuery=""
        onSearchChange={jest.fn()}
        filter="all"
        onFilterChange={jest.fn()}
      />
    );
    expect(screen.getByText('All Proposals')).toBeInTheDocument();
    expect(screen.getByText('Not Voted')).toBeInTheDocument();
    expect(screen.getByText('Voted')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    
    render(
      <ProposalFilters
        searchQuery=""
        onSearchChange={mockOnChange}
        filter="all"
        onFilterChange={jest.fn()}
      />
    );
    
    const input = screen.getByPlaceholderText('Search proposals...');
    await user.type(input, 'test');
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onFilterChange when filter clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = jest.fn();
    
    render(
      <ProposalFilters
        searchQuery=""
        onSearchChange={jest.fn()}
        filter="all"
        onFilterChange={mockOnChange}
      />
    );
    
    await user.click(screen.getByText('Not Voted'));
    expect(mockOnChange).toHaveBeenCalledWith('unvoted');
  });
});
