import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui/Textarea';

describe('Textarea', () => {
  it('renders with label', () => {
    render(<Textarea label="Description" />);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Textarea label="Description" placeholder="Enter description" />);
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
  });

  it('handles value changes', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Textarea label="Description" onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    
    await user.type(textarea, 'Test description');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Textarea label="Description" error="Description is required" />);
    expect(screen.getByText('Description is required')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Textarea label="Description" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('supports custom rows', () => {
    render(<Textarea label="Description" rows={10} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '10');
  });
});
