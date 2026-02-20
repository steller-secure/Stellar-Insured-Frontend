import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '@/components/ui/Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Card onClick={handleClick}>Clickable card</Card>);
    await user.click(screen.getByText('Clickable card'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
