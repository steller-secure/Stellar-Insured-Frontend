import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const { container } = render(<Button disabled>Click me</Button>);
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('shows loading state', () => {
    const { container } = render(<Button isLoading>Click me</Button>);
    const button = container.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('applies variant classes', () => {
    const { container, rerender } = render(<Button variant="primary">Primary</Button>);
    let button = container.querySelector('button');
    expect(button).toHaveClass('bg-cyan-500');
    
    rerender(<Button variant="secondary">Secondary</Button>);
    button = container.querySelector('button');
    expect(button).toHaveClass('bg-slate-800');
    
    rerender(<Button variant="outline">Outline</Button>);
    button = container.querySelector('button');
    expect(button).toHaveClass('border-2');
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Button fullWidth>Full Width</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('w-full');
  });
});
