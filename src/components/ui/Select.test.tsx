import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '@/components/ui/Select';

describe('Select', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders with label', () => {
    render(<Select label="Choose option" options={options} />);
    expect(screen.getByText('Choose option')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<Select label="Choose" options={options} />);
    const select = screen.getByRole('combobox');
    
    expect(select).toBeInTheDocument();
    options.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('handles selection change', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Select label="Choose" options={options} onChange={handleChange} />);
    const select = screen.getByRole('combobox');
    
    await user.selectOptions(select, 'option2');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Select label="Choose" options={options} error="Selection required" />);
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('shows placeholder', () => {
    render(<Select label="Choose" options={options} placeholder="Select an option" />);
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Select label="Choose" options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
