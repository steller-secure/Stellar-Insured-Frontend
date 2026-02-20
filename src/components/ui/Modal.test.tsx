import { render, screen } from '@testing-library/react';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });
});
