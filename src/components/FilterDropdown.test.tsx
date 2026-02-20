import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterDropdown } from '@/components/FilterDropdown';

describe('FilterDropdown', () => {
  const options = [
    { value: 'all', label: 'All Items' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
  ];

  const defaultProps = {
    options,
    selectedValue: 'all',
    onSelect: jest.fn(),
    placeholder: 'Select filter',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with selected value', () => {
    render(<FilterDropdown {...defaultProps} />);
    
    expect(screen.getByText('All Items')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} />);
    
    await user.click(screen.getByText('All Items'));
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('calls onSelect when option clicked', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} />);
    
    await user.click(screen.getByText('All Items'));
    await user.click(screen.getByText('Active'));
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith('active');
  });

  it('closes dropdown after selection', async () => {
    const user = userEvent.setup();
    render(<FilterDropdown {...defaultProps} />);
    
    await user.click(screen.getByText('All Items'));
    await user.click(screen.getByText('Pending'));
    
    expect(screen.queryByText('Active')).not.toBeInTheDocument();
  });
});
