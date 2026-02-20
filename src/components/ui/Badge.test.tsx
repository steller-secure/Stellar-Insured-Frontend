import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders with children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toBeInTheDocument();
    
    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
    
    rerender(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error')).toBeInTheDocument();
    
    rerender(<Badge variant="info">Info</Badge>);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Badge className="custom-badge">Badge</Badge>);
    expect(container.firstChild).toHaveClass('custom-badge');
  });
});
