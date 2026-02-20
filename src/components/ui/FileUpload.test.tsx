import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './FileUpload';

describe('FileUpload', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with label', () => {
    render(<FileUpload label="Upload Document" onChange={mockOnChange} />);
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });

  it('handles file selection via input', async () => {
    const user = userEvent.setup();
    render(<FileUpload label="Upload" onChange={mockOnChange} />);

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByText('Click to upload').closest('div')?.parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      await user.upload(input as HTMLInputElement, file);
      expect(mockOnChange).toHaveBeenCalledWith(file);
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
    }
  });

  it('handles drag and drop', async () => {
    render(<FileUpload label="Upload" onChange={mockOnChange} />);

    const file = new File(['content'], 'dropped.png', { type: 'image/png' });
    const dropZone = screen.getByText('Click to upload').closest('div')?.parentElement;

    if (dropZone) {
      await waitFor(() => {
        const event = new Event('drop', { bubbles: true });
        Object.defineProperty(event, 'dataTransfer', {
          value: { files: [file] }
        });
        dropZone.dispatchEvent(event);
      });
    }
  });

  it('removes selected file', async () => {
    const user = userEvent.setup();
    render(<FileUpload label="Upload" onChange={mockOnChange} />);

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getByText('Click to upload').closest('div')?.parentElement?.querySelector('input[type="file"]');
    
    if (input) {
      await user.upload(input as HTMLInputElement, file);
      const removeButton = screen.getByText('Remove File');
      await user.click(removeButton);
      
      expect(mockOnChange).toHaveBeenCalledWith(null);
    }
  });

  it('displays error message', () => {
    render(<FileUpload label="Upload" onChange={mockOnChange} error="File too large" />);
    expect(screen.getByText('File too large')).toBeInTheDocument();
  });

  it('accepts specific file types', () => {
    render(<FileUpload label="Upload" onChange={mockOnChange} accept=".pdf,.doc" />);
    const input = screen.getByText('Click to upload').closest('div')?.parentElement?.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', '.pdf,.doc');
  });

  it('shows drag active state', async () => {
    render(<FileUpload label="Upload" onChange={mockOnChange} />);
    const dropZone = screen.getByText('Click to upload').closest('div')?.parentElement;

    if (dropZone) {
      const dragEnter = new Event('dragenter', { bubbles: true });
      dropZone.dispatchEvent(dragEnter);
      
      await waitFor(() => {
        expect(dropZone).toHaveClass('border-cyan-500');
      });
    }
  });
});
