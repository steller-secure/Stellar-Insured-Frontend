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

  it('resolves the legacy variant names onto the token palette', () => {
    const { container, rerender } = render(<Button variant="primary">Primary</Button>);
    let button = container.querySelector('button');
    expect(button).toHaveClass('bg-primary', 'text-primary-fg');

    rerender(<Button variant="secondary">Secondary</Button>);
    button = container.querySelector('button');
    expect(button).toHaveClass('bg-neutral', 'text-neutral-fg');

    rerender(<Button variant="danger">Danger</Button>);
    button = container.querySelector('button');
    expect(button).toHaveClass('bg-error', 'text-error-fg');
  });

  it('combines variant and color independently', () => {
    const { container, rerender } = render(
      <Button variant="outline" color="success">Outline</Button>
    );
    let button = container.querySelector('button');
    expect(button).toHaveClass('border-success', 'text-success');

    rerender(<Button variant="soft" color="warning">Soft</Button>);
    button = container.querySelector('button');
    expect(button).toHaveClass('bg-warning-soft', 'text-warning-on-soft');
  });

  it('lets an explicit color override the one implied by a legacy variant', () => {
    const { container } = render(
      <Button variant="danger" color="info">Danger</Button>
    );
    expect(container.querySelector('button')).toHaveClass('bg-info');
  });

  it('applies size classes', () => {
    const { container, rerender } = render(<Button size="sm">Small</Button>);
    expect(container.querySelector('button')).toHaveClass('h-9');

    rerender(<Button size="xl">Extra large</Button>);
    expect(container.querySelector('button')).toHaveClass('h-14');
  });

  it('applies fullWidth class', () => {
    const { container } = render(<Button fullWidth>Full Width</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('w-full');
  });

  it('defaults to type="button" so it cannot submit a form by accident', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container.querySelector('button')).toHaveAttribute('type', 'button');
  });

  it('renders leading and trailing icons', () => {
    render(
      <Button
        leadingIcon={<span data-testid="leading" />}
        trailingIcon={<span data-testid="trailing" />}
      >
        Click me
      </Button>
    );

    expect(screen.getByTestId('leading')).toBeInTheDocument();
    expect(screen.getByTestId('trailing')).toBeInTheDocument();
  });
});
