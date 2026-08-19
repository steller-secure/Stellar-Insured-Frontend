import { render, screen } from '@testing-library/react';
import { Progress } from '@/components/ui/Progress';

describe('Progress', () => {
  it('exposes the value through the progressbar role', () => {
    render(<Progress value={40} label="Upload" />);
    const bar = screen.getByRole('progressbar');

    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAccessibleName('Upload');
  });

  it('clamps values outside the range', () => {
    const { rerender } = render(<Progress value={-20} label="Upload" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');

    rerender(<Progress value={500} label="Upload" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });

  it('scales the percentage against a custom max', () => {
    render(<Progress value={2} max={4} label="Steps" showValue />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('falls back to a max of 100 when given a non-positive one', () => {
    render(<Progress value={50} max={0} label="Steps" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
  });

  it('keeps the label accessible while hiding it visually', () => {
    render(<Progress value={10} label="Steps" hideLabel />);

    expect(screen.queryByText('Steps')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAccessibleName('Steps');
  });

  it('tints the fill with the requested colour', () => {
    const { container } = render(<Progress value={50} label="Steps" color="success" />);
    expect(container.querySelector('[role="progressbar"] > div')).toHaveClass('bg-success');
  });
});
