import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Input label="Email" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    
    await user.type(input, 'test@example.com');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('displays helper text', () => {
    render(<Input label="Email" helperText="We will never share your email" />);
    expect(screen.getByText('We will never share your email')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input label="Email" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('supports different input types', () => {
    const { rerender, container } = render(<Input label="Password" type="password" />);
    let input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
    
    rerender(<Input label="Age" type="number" />);
    input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'number');
  });
});
