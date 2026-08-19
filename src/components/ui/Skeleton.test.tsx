import { render } from '@testing-library/react';
import { Skeleton } from '@/components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders a single placeholder by default', () => {
    const { container } = render(<Skeleton className="h-10 w-full" />);
    const el = container.firstChild as HTMLElement;

    expect(el).toHaveClass('animate-pulse', 'bg-neutral-soft', 'h-10', 'w-full');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies the shape classes', () => {
    const { container, rerender } = render(<Skeleton shape="circle" className="h-8" />);
    expect(container.firstChild).toHaveClass('rounded-pill', 'aspect-square');

    rerender(<Skeleton shape="text" />);
    expect(container.firstChild).toHaveClass('h-4');
  });

  it('stacks multiple text lines and shortens the last one', () => {
    const { container } = render(<Skeleton shape="text" lines={3} />);
    const lines = (container.firstChild as HTMLElement).children;

    expect(lines).toHaveLength(3);
    expect(lines[0]).not.toHaveClass('w-4/5');
    expect(lines[2]).toHaveClass('w-4/5');
  });

  it('ignores the line count for non-text shapes', () => {
    const { container } = render(<Skeleton shape="rect" lines={3} />);
    expect((container.firstChild as HTMLElement).children).toHaveLength(0);
  });
});
