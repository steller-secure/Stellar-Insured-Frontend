import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '@/components/Pagination';

describe('Pagination', () => {
  const defaultProps = {
    totalItems: 100,
    currentPage: 1,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
    pageName: 'Items',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pagination info correctly', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText('100 Items')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calculates total pages correctly', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText(/of 10 Pages/i)).toBeInTheDocument();
  });

  it('calls onPageChange when next button clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} />);
    
    const nextButton = screen.getByLabelText(/next page/i);
    await user.click(nextButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when previous button clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination {...defaultProps} currentPage={5} />);
    
    const prevButton = screen.getByLabelText(/previous page/i);
    await user.click(prevButton);
    
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(4);
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    const prevButton = screen.getByLabelText(/previous page/i);
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={10} />);
    
    const nextButton = screen.getByLabelText(/next page/i);
    expect(nextButton).toBeDisabled();
  });

  it('does not render when only one page', () => {
    const { container } = render(<Pagination {...defaultProps} totalItems={5} />);
    
    expect(container.firstChild).toBeNull();
  });
});
